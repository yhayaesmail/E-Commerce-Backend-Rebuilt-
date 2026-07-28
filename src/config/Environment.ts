import path from "node:path";

export class Environment {
  public readonly port: number;
  public readonly jwtSecret: string;
  public readonly jwtExpiresIn: string;
  public readonly sessionTtlDays: number;
  public readonly nodeEnv: string;
  public readonly logDir: string;
  public readonly publicDir: string;

  public constructor(private readonly env: NodeJS.ProcessEnv = process.env) {
    this.port = this.toNumber(this.env.PORT, 3000);
    this.jwtSecret = this.require("JWT_SECRET");
    this.jwtExpiresIn = this.env.JWT_EXPIRES_IN ?? "7d";
    this.sessionTtlDays = this.toNumber(this.env.SESSION_TTL_DAYS, 7);
    this.nodeEnv = this.env.NODE_ENV ?? "development";
    this.logDir = this.env.LOG_DIR ?? path.join(process.cwd(), "logs");
    this.publicDir = path.join(process.cwd(), "public");
  }

  public get isProduction(): boolean {
    return this.nodeEnv === "production";
  }

  private require(key: string): string {
    const value = this.env[key];

    if (!value || value.trim().length === 0) {
      throw new Error(`Missing required environment variable: ${key}`);
    }

    return value;
  }

  private toNumber(value: string | undefined, fallback: number): number {
    const parsed = Number(value);

    if (!Number.isFinite(parsed) || parsed <= 0) {
      return fallback;
    }

    return parsed;
  }
}

export const environment = new Environment();
