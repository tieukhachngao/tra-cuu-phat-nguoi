import type { Violation } from "../../domain/entities/violation.entity.js";
import type { LookupViolationsUseCase } from "../../application/usecases/lookup-violations.usecase.js";
import type { Messages } from "../../config/i18n/types.js";
import { getMessages } from "../../config/i18n/index.js";

const LICENSE_PLATE_REGEX = /^[0-9]{2}[A-Z][0-9]{5}$/;

function esc(text: string): string {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, "\\$&");
}

function isProcessed(status?: string): boolean {
  return !!status && (status.includes("ĐÃ XỬ PHẠT") || status.includes("Đã xử phạt"));
}

function formatViolation(v: Violation, index: number, total: number, t: Messages): string {
  const icon = isProcessed(v.status) ? "✅" : "🔴";

  const places = v.resolutionPlaces
    .map((p) => {
      const name = esc(p.name);
      const addr = p.address ? `\n     📍 ${esc(p.address)}` : "";
      return `  🏢 ${name}${addr}`;
    })
    .join("\n");

  const lines = [
    `━━━━━━━━━━━━━━━━━━━━`,
    `📋 *${esc(t.violationIndex)} ${index}/${total}*`,
    ``,
    `🚗 *${esc(t.licensePlate)}:* \`${esc(v.licensePlate || "N/A")}\``,
    `🎨 *${esc(t.plateColor)}:* ${esc(v.plateColor || "N/A")}`,
    `🚙 *${esc(t.vehicleType)}:* ${esc(v.vehicleType || "N/A")}`,
    ``,
    `⏰ *${esc(t.time)}:* ${esc(v.violationTime || "N/A")}`,
    `📍 *${esc(t.location)}:* ${esc(v.violationLocation || "N/A")}`,
    ``,
    `⚠️ *${esc(t.behavior)}:*`,
    `${esc(v.violationBehavior || "N/A")}`,
    ``,
    `${icon} *${esc(t.status)}:* ${esc(v.status || "N/A")}`,
    `👮 *${esc(t.detectionUnit)}:*`,
    `${esc(v.detectionUnit || "N/A")}`,
  ];

  if (v.resolutionPlaces.length > 0) {
    lines.push(``, `🏛️ *${esc(t.resolutionPlace)}:*`, places);
  }

  return lines.join("\n");
}

function formatSummary(plate: string, violations: Violation[], t: Messages): string {
  const processed = violations.filter((v) => isProcessed(v.status)).length;
  const pending = violations.length - processed;

  return [
    `🔍 *${esc(t.searchResult)}*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    ``,
    `🚘 *${esc(t.licensePlate)}:* \`${esc(plate)}\``,
    `📊 *${esc(t.totalViolations)}:* ${violations.length}`,
    `✅ *${esc(t.processed)}:* ${processed}`,
    `🔴 *${esc(t.pending)}:* ${pending}`,
  ].join("\n");
}

interface ReplyContext {
  reply: (msg: string, extra?: Record<string, unknown>) => Promise<unknown>;
}

export class ViolationHandler {
  constructor(private readonly lookupUseCase: LookupViolationsUseCase) {}

  async handleLookup(ctx: ReplyContext, plate: string, userId: number): Promise<void> {
    const t = getMessages(userId);
    const md = { parse_mode: "MarkdownV2" };

    if (!LICENSE_PLATE_REGEX.test(plate)) {
      await ctx.reply(
        `⚠️ *${esc(t.invalidFormat)}*\n\n${esc(t.invalidFormatDesc)}: \`30H47465\`\n\n${esc(t.example)}: /tracuu 30H47465`,
        md
      );
      return;
    }

    await ctx.reply(`🔄 ${esc(t.searching)}\\.\\.\\.`, md);

    try {
      const violations = await this.lookupUseCase.execute(plate);
      if (violations && violations.length > 0) {
        await ctx.reply(formatSummary(plate, violations, t), md);
        for (let i = 0; i < violations.length; i++) {
          await ctx.reply(formatViolation(violations[i], i + 1, violations.length, t), md);
        }
      } else {
        await ctx.reply(
          `🎉 *${esc(t.noViolations)}*\n\n\`${esc(plate)}\` ${esc(t.noViolationsDesc)}\\.`,
          md
        );
      }
    } catch {
      await ctx.reply(`❌ ${esc(t.error)}`, md);
    }
  }
}
