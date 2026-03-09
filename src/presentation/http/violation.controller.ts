import type { Request, Response } from "express";
import type { LookupViolationsUseCase } from "../../application/usecases/lookup-violations.usecase.js";

export class ViolationController {
  constructor(private readonly lookupUseCase: LookupViolationsUseCase) {}

  async lookup(req: Request, res: Response): Promise<void> {
    const { licensePlate } = req.query;

    if (!licensePlate || typeof licensePlate !== "string") {
      res.status(400).json({ error: "License plate is required" });
      return;
    }

    try {
      const violations = await this.lookupUseCase.execute(licensePlate.toUpperCase());
      if (violations) {
        res.json({ licensePlate, violations });
      } else {
        res.status(404).json({ error: "No violations found" });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ error: message });
    }
  }
}
