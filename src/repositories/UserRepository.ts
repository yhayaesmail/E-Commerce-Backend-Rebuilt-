import type { PrismaDatabase } from "../infrastructure/database/prisma.js";
import type { Role } from "@prisma/client";

export type CreateUserInput = {
  username: string;
  email: string;
  password: string;
  role?: Role;
};

export class UserRepository {
  public constructor(private readonly database: PrismaDatabase) {}

  public create(input: CreateUserInput) {
    return this.database.user.create({
      data: input,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  public findByEmail(email: string) {
    return this.database.user.findUnique({
      where: { email }
    });
  }

  public findByUsername(username: string) {
    return this.database.user.findUnique({
      where: { username }
    });
  }

  public findPublicById(id: string) {
    return this.database.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }
}
