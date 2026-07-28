import type { Request } from "express";
import { Role } from "@prisma/client";
import { environment } from "../config/Environment.js";
import { ErrorFactory } from "../errors/ErrorFactory.js";
import type { SessionRepository } from "../repositories/SessionRepository.js";
import type { UserRepository } from "../repositories/UserRepository.js";
import { Hash } from "../utils/Hash.js";
import { Validation } from "../utils/Validation.js";
import type { PasswordService } from "./PasswordService.js";
import type { TokenService } from "./TokenService.js";

export type RegisterInput = {
  username: string;
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
  userAgent?: string;
  ipAddress?: string;
};

export class AuthService {
  public constructor(
    private readonly users: UserRepository,
    private readonly sessions: SessionRepository,
    private readonly passwords: PasswordService,
    private readonly tokens: TokenService
  ) {}

  public async register(body: unknown) {
    const input = this.validateRegister(body);
    const [emailUser, usernameUser] = await Promise.all([
      this.users.findByEmail(input.email),
      this.users.findByUsername(input.username)
    ]);

    if (emailUser) {
      throw ErrorFactory.conflict("email is already registered");
    }

    if (usernameUser) {
      throw ErrorFactory.conflict("username is already taken");
    }

    const passwordHash = await this.passwords.hash(input.password);

    return this.users.create({
      username: input.username,
      email: input.email,
      password: passwordHash,
      role: Role.USER
    });
  }

  public async login(body: unknown, req: Request) {
    const input = this.validateLogin(body);
    const user = await this.users.findByEmail(input.email);

    if (!user) {
      throw ErrorFactory.unauthorized("Invalid email or password");
    }

    const isPasswordValid = await this.passwords.verify(input.password, user.password);

    if (!isPasswordValid) {
      throw ErrorFactory.unauthorized("Invalid email or password");
    }

    const sessionId = Hash.uuid();
    const expiresAt = this.createSessionExpiration();
    const token = this.tokens.sign({
      sub: user.id,
      sessionId,
      email: user.email,
      role: user.role
    });

    await this.sessions.create({
      id: sessionId,
      userId: user.id,
      tokenHash: Hash.sha256(token),
      userAgent: req.get("user-agent"),
      ipAddress: req.ip,
      expiresAt
    });

    return {
      token,
      session: {
        id: sessionId,
        expiresAt
      },
      user: this.toPublicUser(user)
    };
  }

  public async logout(token: string): Promise<void> {
    await this.sessions.revokeByTokenHash(Hash.sha256(token));
  }

  public async logoutAll(userId: string): Promise<void> {
    await this.sessions.revokeUserSessions(userId);
  }

  public async me(userId: string) {
    const user = await this.users.findPublicById(userId);

    if (!user) {
      throw ErrorFactory.notFound("User not found");
    }

    return user;
  }

  private validateRegister(body: unknown): RegisterInput {
    const data = Validation.object(body, "body");
    const usernameSource = data.username ?? data.name;

    return {
      username: Validation.string(usernameSource, "username", 2, 80),
      email: Validation.email(data.email),
      password: Validation.password(data.password)
    };
  }

  private validateLogin(body: unknown): LoginInput {
    const data = Validation.object(body, "body");

    return {
      email: Validation.email(data.email),
      password: Validation.string(data.password, "password", 1, 128)
    };
  }

  private createSessionExpiration(): Date {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + environment.sessionTtlDays);
    return expiresAt;
  }

  private toPublicUser(user: { id: string; username: string; email: string; role: Role; createdAt: Date; updatedAt: Date }) {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
}
