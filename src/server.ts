import express from "express";
import { Telegraf } from "telegraf";
import dotenv from "dotenv";
import { TrafficViolationApiRepository } from "./infrastructure/services/traffic-violation-api.repository.js";
import { LookupViolationsUseCase } from "./application/usecases/lookup-violations.usecase.js";
import { ViolationController } from "./presentation/http/violation.controller.js";
import { ViolationHandler } from "./presentation/telegram/violation.handler.js";
import { createRouter } from "./presentation/http/router.js";
import { setLocale, getMessages, type Locale } from "./config/i18n/index.js";

dotenv.config();

const repository = new TrafficViolationApiRepository();
const lookupUseCase = new LookupViolationsUseCase(repository);
const controller = new ViolationController(lookupUseCase);
const handler = new ViolationHandler(lookupUseCase);

const app = express();
app.use(express.json());

// HTTP API
app.use(createRouter(controller));

// Telegram bot
const botToken = process.env.TELEGRAM_BOT_TOKEN;
let bot: Telegraf | undefined;

if (botToken) {
  bot = new Telegraf(botToken);

  bot.telegram.setMyCommands([
    { command: "start", description: "Start the bot" },
    { command: "tracuu", description: "Tra cuu / Look up violations" },
    { command: "lang", description: "Switch language (vi/en)" },
  ]).catch(() => {});

  bot.command("start", async (ctx) => {
    const userId = ctx.from.id;
    const t = getMessages(userId);
    await ctx.reply(`${t.welcome}\n\n${t.welcomeDesc}`, {
      reply_markup: {
        inline_keyboard: [
          [{ text: t.btnLookup, switch_inline_query_current_chat: "" }],
          [
            { text: "Tieng Viet", callback_data: "lang_vi" },
            { text: "English", callback_data: "lang_en" },
          ],
        ],
      },
    });
  });

  bot.action("lang_vi", async (ctx) => {
    const userId = ctx.from!.id;
    setLocale(userId, "vi");
    const t = getMessages(userId);
    await ctx.answerCbQuery(t.langSwitched);
    await ctx.reply(t.langSwitched);
  });

  bot.action("lang_en", async (ctx) => {
    const userId = ctx.from!.id;
    setLocale(userId, "en");
    const t = getMessages(userId);
    await ctx.answerCbQuery(t.langSwitched);
    await ctx.reply(t.langSwitched);
  });

  bot.command("lang", async (ctx) => {
    const userId = ctx.from.id;
    const arg = ctx.message.text.split(" ")[1]?.toLowerCase();

    if (arg === "vi" || arg === "en") {
      setLocale(userId, arg as Locale);
      const t = getMessages(userId);
      await ctx.reply(t.langSwitched);
    } else {
      const t = getMessages(userId);
      await ctx.reply(t.langHelp);
    }
  });

  bot.command("tracuu", async (ctx) => {
    const userId = ctx.from.id;
    const plate = ctx.message.text.split(" ")[1];
    if (!plate) {
      const t = getMessages(userId);
      await ctx.reply(`${t.providePlate}\n\n/tracuu 30H47465`);
      return;
    }
    await handler.handleLookup(ctx, plate, userId);
  });

  bot.on("text", async (ctx) => {
    await handler.handleLookup(ctx, ctx.message.text.trim(), ctx.from.id);
  });

  // Webhook endpoint for Vercel
  const WEBHOOK_PATH = `/api/telegram-webhook`;
  app.post(WEBHOOK_PATH, (req, res) => {
    bot!.handleUpdate(req.body, res);
  });

  // Webhook setup helper
  app.get("/api/set-webhook", async (req, res) => {
    const url = req.query.url as string;
    if (!url) {
      res.status(400).json({ error: "Provide ?url=https://your-domain.vercel.app" });
      return;
    }
    try {
      await bot!.telegram.setWebhook(`${url}${WEBHOOK_PATH}`);
      res.json({ ok: true, webhook: `${url}${WEBHOOK_PATH}` });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: message });
    }
  });

  // If not on Vercel, use polling
  if (!process.env.VERCEL) {
    bot.launch();
    console.log("Telegram bot is running (polling mode)...");
  }
}

// Only listen when not on Vercel
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

export default app;
