import jwt, { type SignOptions } from "jsonwebtoken";
import type { Role } from "@prisma/client";
import { environment } from "../config/Environment.js";
import { ErrorFactory } from "../errors/ErrorFactory.js";

export type AuthTokenPayload = {
  sub: string;
  sessionId: string;
  email: string;
  role: Role;
};

export class TokenService {
  public constructor(
    private readonly jwtSecret: string = environment.jwtSecret,
    private readonly expiresIn: string = environment.jwtExpiresIn
  ) {}

  public sign(payload: AuthTokenPayload): string {
    const options: SignOptions = {
      expiresIn: this.expiresIn as SignOptions["expiresIn"]
    };

    return jwt.sign(payload, this.jwtSecret, options);
  }

  public verify(token: string): AuthTokenPayload {
    const payload = jwt.verify(token, this.jwtSecret);

    if (!payload || typeof payload !== "object") {
      throw ErrorFactory.unauthorized("Invalid or expired token");
    }

    const record = payload as Record<string, unknown>;

    if (
      typeof record.sub !== "string" ||
      typeof record.sessionId !== "string" ||
      typeof record.email !== "string" ||
      typeof record.role !== "string"
    ) {
      throw ErrorFactory.unauthorized("Invalid or expired token");
    }

    return {
      sub: record.sub,
      sessionId: record.sessionId,
      email: record.email,
      role: record.role as Role
    };
  }
}
