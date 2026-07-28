import { Prisma, Role } from "@prisma/client";
import { ErrorFactory } from "../errors/ErrorFactory.js";
import type { PrismaDatabase } from "../infrastructure/database/prisma.js";
import type { OrderRepository } from "../repositories/OrderRepository.js";
import { Validation } from "../utils/Validation.js";
import type { AuthenticatedUser } from "../types/http.js";

type OrderItemInput = {
  productId: string;
  quantity: number;
};

export class OrderService {
  public constructor(
    private readonly database: PrismaDatabase,
    private readonly orders: OrderRepository
  ) {}

  public listForUser(user: AuthenticatedUser) {
    if (user.role === Role.ADMIN) {
      return this.orders.listAll();
    }

    return this.orders.listByUser(user.id);
  }

  public async getById(user: AuthenticatedUser, id: string) {
    const order = await this.orders.findById(id);

    if (!order) {
      throw ErrorFactory.notFound("Order not found");
    }

    if (user.role !== Role.ADMIN && order.userId !== user.id) {
      throw ErrorFactory.forbidden();
    }

    return order;
  }

  public async create(userId: string, body: unknown) {
    const data = Validation.object(body, "body");
    const items = await this.resolveItems(userId, data.items);
    const shippingAddress = Validation.object(data.shippingAddress, "shippingAddress") as Prisma.InputJsonObject;
    const paymentMethod = Validation.string(data.paymentMethod, "paymentMethod", 2, 80);

    if (items.length === 0) {
      throw ErrorFactory.badRequest("Order must include at least one item");
    }

    return this.database.$transaction(async (tx) => {
      const productIds = items.map((item) => item.productId);
      const products = await tx.product.findMany({
        where: {
          id: {
            in: productIds
          }
        }
      });

      if (products.length !== productIds.length) {
        throw ErrorFactory.badRequest("Some products are not available");
      }

      const orderItems = items.map((item) => {
        const product = products.find((candidate) => candidate.id === item.productId);

        if (!product) {
          throw ErrorFactory.badRequest("Some products are not available");
        }

        if (item.quantity > product.stock) {
          throw ErrorFactory.badRequest(`${product.name} does not have enough stock`);
        }

        return {
          product,
          quantity: item.quantity,
          price: product.price
        };
      });

      const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const order = await tx.order.create({
        data: {
          userId,
          total,
          paymentMethod,
          shippingAddress,
          items: {
            create: orderItems.map((item) => ({
              productId: item.product.id,
              quantity: item.quantity,
              price: item.price
            }))
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      await Promise.all(
        orderItems.map((item) =>
          tx.product.update({
            where: {
              id: item.product.id
            },
            data: {
              stock: {
                decrement: item.quantity
              }
            }
          })
        )
      );

      await tx.cart.deleteMany({
        where: {
          userId,
          productId: {
            in: productIds
          }
        }
      });

      return order;
    });
  }

  public async updateStatus(id: string, body: unknown) {
    const data = Validation.object(body, "body");
    const status = Validation.string(data.status, "status", 2, 40);
    await this.orders.findById(id);
    return this.orders.updateStatus(id, status);
  }

  private async resolveItems(userId: string, rawItems: unknown): Promise<OrderItemInput[]> {
    if (rawItems === undefined) {
      const cart = await this.database.cart.findMany({
        where: { userId }
      });

      return cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity
      }));
    }

    if (!Array.isArray(rawItems)) {
      throw ErrorFactory.badRequest("items must be an array");
    }

    return rawItems.map((rawItem) => {
      const item = Validation.object(rawItem, "item");

      return {
        productId: Validation.string(item.productId, "productId", 1, 80),
        quantity: Validation.positiveInteger(item.quantity, "quantity")
      };
    });
  }
}
