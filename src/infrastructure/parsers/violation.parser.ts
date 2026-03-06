import * as cheerio from "cheerio";
import type { Violation, ResolutionPlace } from "../../domain/entities/violation.entity.js";

const FIELD_MAP: Record<string, keyof Omit<Violation, "resolutionPlaces">> = {
  "Biển kiểm soát:": "licensePlate",
  "Màu biển:": "plateColor",
  "Loại phương tiện:": "vehicleType",
  "Thời gian vi phạm:": "violationTime",
  "Địa điểm vi phạm:": "violationLocation",
  "Hành vi vi phạm:": "violationBehavior",
  "Trạng thái:": "status",
  "Đơn vị phát hiện vi phạm:": "detectionUnit",
};

function parseResolutionPlaces(html: string): ResolutionPlace[] {
  const places: ResolutionPlace[] = [];
  const parts = html.split(/<br\s*\/?>/i);
  let current: ResolutionPlace | null = null;

  for (const part of parts) {
    const text = cheerio.load(part).text().trim();
    if (/^\d+\./.test(text)) {
      if (current) places.push(current);
      current = { name: text };
    } else if (text.startsWith("Địa chỉ:") && current) {
      current.address = text.replace("Địa chỉ:", "").trim();
    }
  }

  if (current) places.push(current);
  return places;
}

export function parseViolationsHtml(html: string): Violation[] {
  const $ = cheerio.load(html);
  const violations: Violation[] = [];

  $("table").each((_index, table) => {
    const fields: Record<string, string> = {};
    let resolutionPlaces: ResolutionPlace[] = [];

    $(table)
      .find("tr")
      .each((_i, row) => {
        const cells = $(row).find("td");
        if (cells.length < 2) return;

        const label = $(cells[0]).text().trim();
        const value = $(cells[1]).text().trim();

        if (label === "Nơi giải quyết vụ việc:") {
          const cellHtml = $(cells[1]).html();
          if (cellHtml) resolutionPlaces = parseResolutionPlaces(cellHtml);
          return;
        }

        const field = FIELD_MAP[label];
        if (field) fields[field] = value;
      });

    if (Object.keys(fields).length > 0) {
      violations.push({ ...fields, resolutionPlaces } as Violation);
    }
  });

  return violations;
}
