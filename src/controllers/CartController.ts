import type { Request, Response } from "express";
import { ErrorFactory } from "../errors/ErrorFactory.js";
import type { CartService } from "../services/CartService.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Validation } from "../utils/Validation.js";

export class CartController {
  public constructor(private readonly cart: CartService) {}

  public list = async (req: Request, res: Response): Promise<Response> => {
    const userId = this.getUserId(req);
    const cart = await this.cart.list(userId);
    return ApiResponse.ok(res, { cart });
  };

  public add = async (req: Request, res: Response): Promise<Response> => {
    const userId = this.getUserId(req);
    const cartItem = await this.cart.add(userId, req.body);
    return ApiResponse.created(res, { cartItem });
  };

  public update = async (req: Request, res: Response): Promise<Response> => {
    const userId = this.getUserId(req);
    const cartItem = await this.cart.update(userId, Validation.string(req.params.productId, "productId"), req.body);
    return ApiResponse.ok(res, { cartItem });
  };

  public remove = async (req: Request, res: Response): Promise<Response> => {
    const userId = this.getUserId(req);
    await this.cart.remove(userId, Validation.string(req.params.productId, "productId"));
    return ApiResponse.message(res, "Cart item removed successfully");
  };

  public clear = async (req: Request, res: Response): Promise<Response> => {
    const userId = this.getUserId(req);
    await this.cart.clear(userId);
    return ApiResponse.message(res, "Cart cleared successfully");
  };

  private getUserId(req: Request): string {
    if (!req.authenticatedUser) {
      throw ErrorFactory.unauthorized();
    }

    return req.authenticatedUser.id;
  }
}
