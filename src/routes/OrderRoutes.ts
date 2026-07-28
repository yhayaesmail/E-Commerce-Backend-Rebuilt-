import { Router } from "express";
import { Role } from "@prisma/client";
import type { OrderController } from "../controllers/OrderController.js";
import type { AuthMiddleware } from "../middleware/AuthMiddleware.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

export class OrderRoutes {
  public constructor(
    private readonly controller: OrderController,
    private readonly auth: AuthMiddleware
  ) {}

  public build(): Router {
    const router = Router();

    router.use(this.auth.authenticate);
    router.get("/", asyncHandler(this.controller.list));
    router.get("/:id", asyncHandler(this.controller.getById));
    router.post("/", asyncHandler(this.controller.create));
    router.patch("/:id/status", this.auth.authorize(Role.ADMIN), asyncHandler(this.controller.updateStatus));

    return router;
  }
}
