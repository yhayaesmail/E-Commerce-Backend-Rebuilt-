import type { PrismaDatabase } from "../infrastructure/database/prisma.js";

export class OrderRepository {
  public constructor(private readonly database: PrismaDatabase) {}

  public listByUser(userId: string) {
    return this.database.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  }

  public listAll() {
    return this.database.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  }

  public findById(id: string) {
    return this.database.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });
  }

  public updateStatus(id: string, status: string) {
    return this.database.order.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });
  }
}
