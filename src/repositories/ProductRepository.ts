import { Prisma } from "@prisma/client";
import type { PrismaDatabase } from "../infrastructure/database/prisma.js";

export type ProductListInput = {
  page: number;
  limit: number;
  category?: string;
  search?: string;
  sortBy?: "name" | "price" | "createdAt";
  sortOrder?: "asc" | "desc";
};

export type ProductWriteInput = {
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  stock: number;
};

export class ProductRepository {
  public constructor(private readonly database: PrismaDatabase) {}

  public async list(input: ProductListInput) {
    const where = this.buildWhere(input);
    const orderBy = this.buildOrder(input);
    const [products, total] = await Promise.all([
      this.database.product.findMany({
        where,
        orderBy,
        skip: (input.page - 1) * input.limit,
        take: input.limit
      }),
      this.database.product.count({ where })
    ]);

    return {
      products,
      total
    };
  }

  public findById(id: string) {
    return this.database.product.findUnique({
      where: { id }
    });
  }

  public create(input: ProductWriteInput) {
    return this.database.product.create({
      data: input
    });
  }

  public update(id: string, input: Partial<ProductWriteInput>) {
    return this.database.product.update({
      where: { id },
      data: input
    });
  }

  public delete(id: string) {
    return this.database.product.delete({
      where: { id }
    });
  }

  public async categories() {
    const categories = await this.database.product.findMany({
      distinct: ["category"],
      select: {
        category: true
      },
      orderBy: {
        category: "asc"
      }
    });

    return categories.map((item) => item.category);
  }

  private buildWhere(input: ProductListInput): Prisma.ProductWhereInput {
    const where: Prisma.ProductWhereInput = {};

    if (input.category) {
      where.category = input.category;
    }

    if (input.search) {
      where.OR = [
        { name: { contains: input.search, mode: "insensitive" } },
        { description: { contains: input.search, mode: "insensitive" } },
        { category: { contains: input.search, mode: "insensitive" } }
      ];
    }

    return where;
  }

  private buildOrder(input: ProductListInput): Prisma.ProductOrderByWithRelationInput {
    return {
      [input.sortBy ?? "name"]: input.sortOrder ?? "asc"
    };
  }
}
