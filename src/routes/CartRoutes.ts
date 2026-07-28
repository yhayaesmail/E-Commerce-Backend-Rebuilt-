import { Router } from "express";
import type { CartController } from "../controllers/CartController.js";
import type { AuthMiddleware } from "../middleware/AuthMiddleware.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

export class CartRoutes {
  public constructor(
    private readonly controller: CartController,
    private readonly auth: AuthMiddleware
  ) {}

  public build(): Router {
    const router = Router();

    router.use(this.auth.authenticate);
    router.get("/", asyncHandler(this.controller.list));
    router.post("/", asyncHandler(this.controller.add));
    router.put("/:productId", asyncHandler(this.controller.update));
    router.delete("/:productId", asyncHandler(this.controller.remove));
    router.delete("/", asyncHandler(this.controller.clear));

    return router;
  }
}
