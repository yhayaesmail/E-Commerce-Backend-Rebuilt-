import type { PrismaDatabase } from "../infrastructure/database/prisma.js";

export class CartRepository {
  public constructor(private readonly database: PrismaDatabase) {}

  public listByUser(userId: string) {
    return this.database.cart.findMany({
      where: { userId },
      include: {
        product: true
      },
      orderBy: {
        addedAt: "desc"
      }
    });
  }

  public findItem(userId: string, productId: string) {
    return this.database.cart.findUnique({
      where: {
        userId_productId: {
          userId,
          productId
        }
      },
      include: {
        product: true
      }
    });
  }

  public create(userId: string, productId: string, quantity: number) {
    return this.database.cart.create({
      data: {
        userId,
        productId,
        quantity
      },
      include: {
        product: true
      }
    });
  }

  public updateQuantity(userId: string, productId: string, quantity: number) {
    return this.database.cart.update({
      where: {
        userId_productId: {
          userId,
          productId
        }
      },
      data: {
        quantity
      },
      include: {
        product: true
      }
    });
  }

  public remove(userId: string, productId: string) {
    return this.database.cart.delete({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    });
  }

  public clear(userId: string) {
    return this.database.cart.deleteMany({
      where: {
        userId
      }
    });
  }
}
