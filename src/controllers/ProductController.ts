import type { Request, Response } from "express";
import type { ProductService } from "../services/ProductService.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Validation } from "../utils/Validation.js";

export class ProductController {
  public constructor(private readonly products: ProductService) {}

  public list = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.products.list(req.query);
    return ApiResponse.ok(res, result);
  };

  public getById = async (req: Request, res: Response): Promise<Response> => {
    const product = await this.products.getById(Validation.string(req.params.id, "id"));
    return ApiResponse.ok(res, { product });
  };

  public categories = async (_req: Request, res: Response): Promise<Response> => {
    const categories = await this.products.categories();
    return ApiResponse.ok(res, { categories });
  };

  public create = async (req: Request, res: Response): Promise<Response> => {
    const product = await this.products.create(req.body);
    return ApiResponse.created(res, { product });
  };

  public update = async (req: Request, res: Response): Promise<Response> => {
    const product = await this.products.update(Validation.string(req.params.id, "id"), req.body);
    return ApiResponse.ok(res, { product });
  };

  public delete = async (req: Request, res: Response): Promise<Response> => {
    await this.products.delete(Validation.string(req.params.id, "id"));
    return ApiResponse.message(res, "Product deleted successfully");
  };
}
