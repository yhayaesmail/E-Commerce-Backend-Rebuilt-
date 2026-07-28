import { Router } from "express";
import type { AuthController } from "../controllers/AuthController.js";
import type { AuthMiddleware } from "../middleware/AuthMiddleware.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

export class AuthRoutes {
  public constructor(
    private readonly controller: AuthController,
    private readonly auth: AuthMiddleware
  ) {}

  public build(): Router {
    const router = Router();

    router.post("/register", asyncHandler(this.controller.register));
    router.post("/login", asyncHandler(this.controller.login));
    router.post("/logout", this.auth.authenticate, asyncHandler(this.controller.logout));
    router.post("/logout-all", this.auth.authenticate, asyncHandler(this.controller.logoutAll));
    router.get("/me", this.auth.authenticate, asyncHandler(this.controller.me));

    return router;
  }
}
