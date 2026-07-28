import type { PrismaDatabase } from "../infrastructure/database/prisma.js";

export type CreateSessionInput = {
  id: string;
  userId: string;
  tokenHash: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
};

export class SessionRepository {
  public constructor(private readonly database: PrismaDatabase) {}

  public create(input: CreateSessionInput) {
    return this.database.session.create({
      data: input
    });
  }

  public findActiveByTokenHash(tokenHash: string) {
    return this.database.session.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        user: true
      }
    });
  }

  public revokeByTokenHash(tokenHash: string) {
    return this.database.session.updateMany({
      where: {
        tokenHash,
        revokedAt: null
      },
      data: {
        revokedAt: new Date()
      }
    });
  }

  public revokeUserSessions(userId: string) {
    return this.database.session.updateMany({
      where: {
        userId,
        revokedAt: null
      },
      data: {
        revokedAt: new Date()
      }
    });
  }
}
