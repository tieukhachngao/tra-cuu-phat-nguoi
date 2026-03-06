import { Telegraf } from "telegraf";
import dotenv from "dotenv";
import { TrafficViolationApiRepository } from "./infrastructure/services/traffic-violation-api.repository.js";
import { LookupViolationsUseCase } from "./application/usecases/lookup-violations.usecase.js";
import { ViolationHandler } from "./presentation/telegram/violation.handler.js";
import { setLocale, getMessages, type Locale } from "./config/i18n/index.js";

dotenv.config();

if (!process.env.TELEGRAM_BOT_TOKEN) {
  console.error("Error: TELEGRAM_BOT_TOKEN is not set in the .env file.");
  process.exit(1);
}

const repository = new TrafficViolationApiRepository();
const lookupUseCase = new LookupViolationsUseCase(repository);
const handler = new ViolationHandler(lookupUseCase);

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.telegram.setMyCommands([
  { command: "tracuu", description: "Tra cuu / Look up violations" },
  { command: "lang", description: "Switch language (vi/en)" },
]);

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

bot.launch();
console.log("Telegram bot is running...");
