import { ErrorFactory } from "../errors/ErrorFactory.js";
import type { ProductRepository, ProductWriteInput } from "../repositories/ProductRepository.js";
import { Validation } from "../utils/Validation.js";

export class ProductService {
  public constructor(private readonly products: ProductRepository) {}

  public async list(query: Record<string, unknown>) {
    const page = Math.min(Validation.positiveInteger(query.page, "page", 1), 500);
    const limit = Math.min(Validation.positiveInteger(query.limit, "limit", 12), 100);
    const category = typeof query.category === "string" && query.category.trim() ? query.category.trim() : undefined;
    const search = typeof query.search === "string" && query.search.trim() ? query.search.trim() : undefined;
    const sortBy = this.parseSortBy(query.sortBy);
    const sortOrder = query.sortOrder === "desc" ? "desc" : "asc";
    const result = await this.products.list({ page, limit, category, search, sortBy, sortOrder });

    return {
      products: result.products,
      pagination: {
        total: result.total,
        page,
        limit,
        pages: Math.ceil(result.total / limit)
      }
    };
  }

  public async getById(id: string) {
    const product = await this.products.findById(id);

    if (!product) {
      throw ErrorFactory.notFound("Product not found");
    }

    return product;
  }

  public categories() {
    return this.products.categories();
  }

  public create(body: unknown) {
    return this.products.create(this.validateWrite(body));
  }

  public async update(id: string, body: unknown) {
    await this.getById(id);
    return this.products.update(id, this.validatePartialWrite(body));
  }

  public async delete(id: string) {
    await this.getById(id);
    await this.products.delete(id);
  }

  private validateWrite(body: unknown): ProductWriteInput {
    const data = Validation.object(body, "body");

    return {
      name: Validation.string(data.name, "name", 2, 160),
      price: Validation.nonNegativeNumber(data.price, "price"),
      image: Validation.string(data.image, "image", 1, 1000),
      description: Validation.string(data.description, "description", 1, 3000),
      category: Validation.string(data.category, "category", 2, 100),
      stock: Validation.nonNegativeInteger(data.stock, "stock", 0)
    };
  }

  private validatePartialWrite(body: unknown): Partial<ProductWriteInput> {
    const data = Validation.object(body, "body");
    const input: Partial<ProductWriteInput> = {};

    if (data.name !== undefined) {
      input.name = Validation.string(data.name, "name", 2, 160);
    }

    if (data.price !== undefined) {
      input.price = Validation.nonNegativeNumber(data.price, "price");
    }

    if (data.image !== undefined) {
      input.image = Validation.string(data.image, "image", 1, 1000);
    }

    if (data.description !== undefined) {
      input.description = Validation.string(data.description, "description", 1, 3000);
    }

    if (data.category !== undefined) {
      input.category = Validation.string(data.category, "category", 2, 100);
    }

    if (data.stock !== undefined) {
      input.stock = Validation.nonNegativeInteger(data.stock, "stock", 0);
    }

    if (Object.keys(input).length === 0) {
      throw ErrorFactory.badRequest("No product fields provided");
    }

    return input;
  }

  private parseSortBy(value: unknown): "name" | "price" | "createdAt" {
    if (value === "price" || value === "createdAt") {
      return value;
    }

    return "name";
  }
}
