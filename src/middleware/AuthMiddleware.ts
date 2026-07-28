import type { NextFunction, Request, Response } from "express";
import type { Role } from "@prisma/client";
import { ErrorFactory } from "../errors/ErrorFactory.js";
import type { SessionRepository } from "../repositories/SessionRepository.js";
import { Hash } from "../utils/Hash.js";
import type { TokenService } from "../services/TokenService.js";

export class AuthMiddleware {
  public constructor(
    private readonly tokens: TokenService,
    private readonly sessions: SessionRepository
  ) {}

  public authenticate = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = this.extractToken(req);
      const payload = this.tokens.verify(token);
      const session = await this.sessions.findActiveByTokenHash(Hash.sha256(token));

      if (!session || session.id !== payload.sessionId || session.userId !== payload.sub) {
        throw ErrorFactory.unauthorized("Invalid or expired session");
      }

      req.authToken = token;
      req.authenticatedUser = {
        id: session.user.id,
        email: session.user.email,
        username: session.user.username,
        role: session.user.role,
        sessionId: session.id
      };

      next();
    } catch (error) {
      next(error);
    }
  };

  public authorize = (...roles: Role[]) => {
    return (req: Request, _res: Response, next: NextFunction): void => {
      if (!req.authenticatedUser) {
        next(ErrorFactory.unauthorized());
        return;
      }

      if (!roles.includes(req.authenticatedUser.role)) {
        next(ErrorFactory.forbidden());
        return;
      }

      next();
    };
  };

  private extractToken(req: Request): string {
    const header = req.get("authorization");

    if (!header || !header.startsWith("Bearer ")) {
      throw ErrorFactory.unauthorized();
    }

    const token = header.slice("Bearer ".length).trim();

    if (!token) {
      throw ErrorFactory.unauthorized();
    }

    return token;
  }
}
