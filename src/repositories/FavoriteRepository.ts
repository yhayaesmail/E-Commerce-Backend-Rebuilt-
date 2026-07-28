import type { PrismaDatabase } from "../infrastructure/database/prisma.js";

export class FavoriteRepository {
  public constructor(private readonly database: PrismaDatabase) {}

  public listByUser(userId: string) {
    return this.database.favorite.findMany({
      where: { userId },
      include: {
        product: true
      },
      orderBy: {
        addedAt: "desc"
      }
    });
  }

  public find(userId: string, productId: string) {
    return this.database.favorite.findUnique({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    });
  }

  public create(userId: string, productId: string) {
    return this.database.favorite.create({
      data: {
        userId,
        productId
      },
      include: {
        product: true
      }
    });
  }

  public remove(userId: string, productId: string) {
    return this.database.favorite.delete({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    });
  }
}
