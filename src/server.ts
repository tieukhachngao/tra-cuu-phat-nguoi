import express from "express";
import { TrafficViolationApiRepository } from "./infrastructure/services/traffic-violation-api.repository.js";
import { LookupViolationsUseCase } from "./application/usecases/lookup-violations.usecase.js";
import { ViolationController } from "./presentation/http/violation.controller.js";
import { createRouter } from "./presentation/http/router.js";

const repository = new TrafficViolationApiRepository();
const lookupUseCase = new LookupViolationsUseCase(repository);
const controller = new ViolationController(lookupUseCase);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(createRouter(controller));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
