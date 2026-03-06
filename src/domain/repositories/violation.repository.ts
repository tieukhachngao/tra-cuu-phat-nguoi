import type { Violation } from "../entities/violation.entity.js";

export interface ViolationRepository {
  findByPlate(plate: string): Promise<Violation[] | null>;
}
