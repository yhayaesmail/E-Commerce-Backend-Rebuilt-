import { ErrorFactory } from "../errors/ErrorFactory.js";
import type { FavoriteRepository } from "../repositories/FavoriteRepository.js";
import type { ProductRepository } from "../repositories/ProductRepository.js";

export class FavoriteService {
  public constructor(
    private readonly favorites: FavoriteRepository,
    private readonly products: ProductRepository
  ) {}

  public list(userId: string) {
    return this.favorites.listByUser(userId);
  }

  public async add(userId: string, productId: string) {
    const product = await this.products.findById(productId);

    if (!product) {
      throw ErrorFactory.notFound("Product not found");
    }

    const existing = await this.favorites.find(userId, productId);

    if (existing) {
      return existing;
    }

    return this.favorites.create(userId, productId);
  }

  public async remove(userId: string, productId: string): Promise<void> {
    const existing = await this.favorites.find(userId, productId);

    if (!existing) {
      throw ErrorFactory.notFound("Favorite not found");
    }

    await this.favorites.remove(userId, productId);
  }
}
