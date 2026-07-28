import type { PrismaDatabase } from "../infrastructure/database/prisma.js";

export type CreateContactInput = {
  name: string;
  email: string;
  message: string;
};

export class ContactRepository {
  public constructor(private readonly database: PrismaDatabase) {}

  public create(input: CreateContactInput) {
    return this.database.contact.create({
      data: input
    });
  }
}
