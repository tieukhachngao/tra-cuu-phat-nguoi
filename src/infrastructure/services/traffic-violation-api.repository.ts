import axios from "axios";
import type { Violation } from "../../domain/entities/violation.entity.js";
import type { ViolationRepository } from "../../domain/repositories/violation.repository.js";
import { parseViolationsHtml } from "../parsers/violation.parser.js";
import { apiConfig } from "../../config/api.config.js";

export class TrafficViolationApiRepository implements ViolationRepository {
  private readonly maxRetries = apiConfig.maxRetries;

  async findByPlate(plate: string): Promise<Violation[] | null> {
    return this.fetch(plate, this.maxRetries);
  }

  private async fetch(plate: string, retries: number): Promise<Violation[] | null> {
    try {
      console.log("Fetching traffic violations for plate:", plate);

      const { data: html } = await axios.get<string>(
        `${apiConfig.baseUrl}${apiConfig.lookupPath}/${plate}/${apiConfig.vehicleType}`,
        { headers: apiConfig.headers }
      );

      if (!html || typeof html !== "string" || html.includes("Hãy tra cứu")) {
        if (retries > 0) {
          console.log(`Request failed. Retrying... (${this.maxRetries - retries + 1}/${this.maxRetries})`);
          return this.fetch(plate, retries - 1);
        }
        return null;
      }

      const violations = parseViolationsHtml(html);
      return violations.length > 0 ? violations : null;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Error fetching violations for plate ${plate}:`, message);

      if (retries > 0) {
        console.log(`Retrying... (${this.maxRetries - retries + 1}/${this.maxRetries})`);
        return this.fetch(plate, retries - 1);
      }
      return null;
    }
  }
}
