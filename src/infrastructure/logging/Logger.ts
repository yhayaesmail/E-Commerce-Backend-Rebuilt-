import { appendFileSync, closeSync, mkdirSync, openSync } from "node:fs";
import path from "node:path";
import { environment } from "../../config/Environment.js";

type LogLevel = "info" | "warn" | "error";

type LogRecord = {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
};

export interface LoggerPort {
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
}

export class FileLogger implements LoggerPort {
  private readonly appLogPath: string;
  private readonly errorLogPath: string;

  public constructor(logDir: string = environment.logDir) {
    mkdirSync(logDir, { recursive: true });
    this.appLogPath = path.join(logDir, "app.log");
    this.errorLogPath = path.join(logDir, "error.log");
    closeSync(openSync(this.appLogPath, "a"));
    closeSync(openSync(this.errorLogPath, "a"));
  }

  public info(message: string, context?: Record<string, unknown>): void {
    this.write("info", message, context);
  }

  public warn(message: string, context?: Record<string, unknown>): void {
    this.write("warn", message, context);
  }

  public error(message: string, context?: Record<string, unknown>): void {
    this.write("error", message, context);
  }

  private write(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    const record: LogRecord = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context
    };

    const line = `${JSON.stringify(record)}\n`;
    appendFileSync(level === "error" ? this.errorLogPath : this.appLogPath, line, "utf8");
  }
}

export const logger = new FileLogger();
