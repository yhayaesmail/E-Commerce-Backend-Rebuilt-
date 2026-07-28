import type { Request, Response } from "express";
import { ErrorFactory } from "../errors/ErrorFactory.js";
import type { AuthService } from "../services/AuthService.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export class AuthController {
  public constructor(private readonly auth: AuthService) {}

  public register = async (req: Request, res: Response): Promise<Response> => {
    const user = await this.auth.register(req.body);
    return ApiResponse.created(res, { user });
  };

  public login = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.auth.login(req.body, req);
    return ApiResponse.ok(res, result);
  };

  public logout = async (req: Request, res: Response): Promise<Response> => {
    if (!req.authToken) {
      throw ErrorFactory.unauthorized();
    }

    await this.auth.logout(req.authToken);
    return ApiResponse.message(res, "Logged out successfully");
  };

  public logoutAll = async (req: Request, res: Response): Promise<Response> => {
    if (!req.authenticatedUser) {
      throw ErrorFactory.unauthorized();
    }

    await this.auth.logoutAll(req.authenticatedUser.id);
    return ApiResponse.message(res, "All sessions logged out successfully");
  };

  public me = async (req: Request, res: Response): Promise<Response> => {
    if (!req.authenticatedUser) {
      throw ErrorFactory.unauthorized();
    }

    const user = await this.auth.me(req.authenticatedUser.id);
    return ApiResponse.ok(res, { user });
  };
}
