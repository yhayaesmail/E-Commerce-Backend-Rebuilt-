import type { Request, Response } from "express";
import { ErrorFactory } from "../errors/ErrorFactory.js";
import type { OrderService } from "../services/OrderService.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Validation } from "../utils/Validation.js";

export class OrderController {
  public constructor(private readonly orders: OrderService) {}

  public list = async (req: Request, res: Response): Promise<Response> => {
    const user = this.getUser(req);
    const orders = await this.orders.listForUser(user);
    return ApiResponse.ok(res, { orders });
  };

  public getById = async (req: Request, res: Response): Promise<Response> => {
    const user = this.getUser(req);
    const order = await this.orders.getById(user, Validation.string(req.params.id, "id"));
    return ApiResponse.ok(res, { order });
  };

  public create = async (req: Request, res: Response): Promise<Response> => {
    const user = this.getUser(req);
    const order = await this.orders.create(user.id, req.body);
    return ApiResponse.created(res, { order });
  };

  public updateStatus = async (req: Request, res: Response): Promise<Response> => {
    const order = await this.orders.updateStatus(Validation.string(req.params.id, "id"), req.body);
    return ApiResponse.ok(res, { order });
  };

  private getUser(req: Request) {
    if (!req.authenticatedUser) {
      throw ErrorFactory.unauthorized();
    }

    return req.authenticatedUser;
  }
}
