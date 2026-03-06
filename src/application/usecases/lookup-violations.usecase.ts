import type { Violation } from "../../domain/entities/violation.entity.js";
import type { ViolationRepository } from "../../domain/repositories/violation.repository.js";

export class LookupViolationsUseCase {
  constructor(private readonly repository: ViolationRepository) {}

  async execute(plate: string): Promise<Violation[] | null> {
    if (!plate || plate.trim().length === 0) {
      throw new Error("License plate is required");
    }

    return this.repository.findByPlate(plate.trim());
  }
}
