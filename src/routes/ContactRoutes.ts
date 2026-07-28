import { Router } from "express";
import type { ContactController } from "../controllers/ContactController.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

export class ContactRoutes {
  public constructor(private readonly controller: ContactController) {}

  public build(): Router {
    const router = Router();
    router.post("/", asyncHandler(this.controller.create));
    return router;
  }
}
