import type { Request, Response } from "express";
import { ErrorFactory } from "../errors/ErrorFactory.js";
import type { FavoriteService } from "../services/FavoriteService.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Validation } from "../utils/Validation.js";

export class FavoriteController {
  public constructor(private readonly favorites: FavoriteService) {}

  public list = async (req: Request, res: Response): Promise<Response> => {
    const userId = this.getUserId(req);
    const favorites = await this.favorites.list(userId);
    return ApiResponse.ok(res, { favorites });
  };

  public add = async (req: Request, res: Response): Promise<Response> => {
    const userId = this.getUserId(req);
    const favorite = await this.favorites.add(userId, Validation.string(req.params.productId, "productId"));
    return ApiResponse.created(res, { favorite });
  };

  public remove = async (req: Request, res: Response): Promise<Response> => {
    const userId = this.getUserId(req);
    await this.favorites.remove(userId, Validation.string(req.params.productId, "productId"));
    return ApiResponse.message(res, "Favorite removed successfully");
  };

  private getUserId(req: Request): string {
    if (!req.authenticatedUser) {
      throw ErrorFactory.unauthorized();
    }

    return req.authenticatedUser.id;
  }
}
