import { Router } from "express";
import { Role } from "@prisma/client";
import type { ProductController } from "../controllers/ProductController.js";
import type { AuthMiddleware } from "../middleware/AuthMiddleware.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

export class ProductRoutes {
  public constructor(
    private readonly controller: ProductController,
    private readonly auth: AuthMiddleware
  ) {}

  public build(): Router {
    const router = Router();

    router.get("/", asyncHandler(this.controller.list));
    router.get("/categories", asyncHandler(this.controller.categories));
    router.get("/:id", asyncHandler(this.controller.getById));
    router.post("/", this.auth.authenticate, this.auth.authorize(Role.ADMIN), asyncHandler(this.controller.create));
    router.patch("/:id", this.auth.authenticate, this.auth.authorize(Role.ADMIN), asyncHandler(this.controller.update));
    router.delete("/:id", this.auth.authenticate, this.auth.authorize(Role.ADMIN), asyncHandler(this.controller.delete));

    return router;
  }
}
