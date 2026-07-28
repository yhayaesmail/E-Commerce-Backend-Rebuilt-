import type { NextFunction, Request, Response } from "express";
import type { LoggerPort } from "../infrastructure/logging/Logger.js";
import { logger } from "../infrastructure/logging/Logger.js";

export class RequestLoggerMiddleware {
  public constructor(private readonly appLogger: LoggerPort = logger) {}

  public handle = (req: Request, res: Response, next: NextFunction): void => {
    const startedAt = Date.now();

    res.on("finish", () => {
      this.appLogger.info("http_request", {
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: Date.now() - startedAt,
        userId: req.authenticatedUser?.id,
        ip: req.ip
      });
    });

    next();
  };
}
