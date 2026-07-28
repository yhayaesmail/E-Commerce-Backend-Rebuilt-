import { ErrorFactory } from "../errors/ErrorFactory.js";
import type { CartRepository } from "../repositories/CartRepository.js";
import type { ProductRepository } from "../repositories/ProductRepository.js";
import { Validation } from "../utils/Validation.js";

export class CartService {
  public constructor(
    private readonly carts: CartRepository,
    private readonly products: ProductRepository
  ) {}

  public async list(userId: string) {
    const items = await this.carts.listByUser(userId);
    const subtotal = items.reduce((total, item) => total + item.quantity * item.product.price, 0);

    return {
      items,
      summary: {
        count: items.reduce((total, item) => total + item.quantity, 0),
        subtotal,
        shipping: subtotal > 0 ? 5 : 0,
        total: subtotal > 0 ? subtotal + 5 : 0
      }
    };
  }

  public async add(userId: string, body: unknown) {
    const data = Validation.object(body, "body");
    const productId = Validation.string(data.productId, "productId", 1, 80);
    const quantity = Validation.positiveInteger(data.quantity, "quantity", 1);
    const product = await this.products.findById(productId);

    if (!product) {
      throw ErrorFactory.notFound("Product not found");
    }

    const existing = await this.carts.findItem(userId, productId);
    const nextQuantity = (existing?.quantity ?? 0) + quantity;

    if (nextQuantity > product.stock) {
      throw ErrorFactory.badRequest("Requested quantity exceeds available stock");
    }

    if (existing) {
      return this.carts.updateQuantity(userId, productId, nextQuantity);
    }

    return this.carts.create(userId, productId, quantity);
  }

  public async update(userId: string, productId: string, body: unknown) {
    const data = Validation.object(body, "body");
    const quantity = Validation.positiveInteger(data.quantity, "quantity");
    const product = await this.products.findById(productId);

    if (!product) {
      throw ErrorFactory.notFound("Product not found");
    }

    if (quantity > product.stock) {
      throw ErrorFactory.badRequest("Requested quantity exceeds available stock");
    }

    const existing = await this.carts.findItem(userId, productId);

    if (!existing) {
      throw ErrorFactory.notFound("Cart item not found");
    }

    return this.carts.updateQuantity(userId, productId, quantity);
  }

  public async remove(userId: string, productId: string): Promise<void> {
    const existing = await this.carts.findItem(userId, productId);

    if (!existing) {
      throw ErrorFactory.notFound("Cart item not found");
    }

    await this.carts.remove(userId, productId);
  }

  public clear(userId: string) {
    return this.carts.clear(userId);
  }
}
