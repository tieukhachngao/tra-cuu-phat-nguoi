import { Router } from "express";
import type { ViolationController } from "./violation.controller.js";

export function createRouter(controller: ViolationController): Router {
  const router = Router();

  router.get("/api", (req, res) => controller.lookup(req, res));

  return router;
}
