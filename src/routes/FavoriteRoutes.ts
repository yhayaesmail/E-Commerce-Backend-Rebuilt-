import { Router } from "express";
import type { FavoriteController } from "../controllers/FavoriteController.js";
import type { AuthMiddleware } from "../middleware/AuthMiddleware.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

export class FavoriteRoutes {
  public constructor(
    private readonly controller: FavoriteController,
    private readonly auth: AuthMiddleware
  ) {}

  public build(): Router {
    const router = Router();

    router.use(this.auth.authenticate);
    router.get("/", asyncHandler(this.controller.list));
    router.post("/:productId", asyncHandler(this.controller.add));
    router.delete("/:productId", asyncHandler(this.controller.remove));

    return router;
  }
}
