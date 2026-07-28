import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { AppError } from "../errors/AppError.js";
import type { LoggerPort } from "../infrastructure/logging/Logger.js";
import { logger } from "../infrastructure/logging/Logger.js";

export class ErrorMiddleware {
  public constructor(private readonly appLogger: LoggerPort = logger) {}

  public handle = (error: unknown, req: Request, res: Response, _next: NextFunction): Response => {
    const appError = this.toAppError(error);

    this.appLogger.error(appError.message, {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: appError.statusCode,
      code: appError.code,
      details: appError.details,
      stack: appError.stack
    });

    return res.status(appError.statusCode).json({
      success: false,
      message: appError.message,
      errors: appError.details
    });
  };

  private toAppError(error: unknown): AppError {
    if (error instanceof AppError) {
      return error;
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return new AppError("Resource already exists", 409, "UNIQUE_CONSTRAINT", error.meta);
      }

      if (error.code === "P2025") {
        return new AppError("Resource not found", 404, "NOT_FOUND", error.meta);
      }
    }

    if (error instanceof Error) {
      return new AppError(error.message, 500, "INTERNAL_ERROR");
    }

    return new AppError("Internal Server Error", 500, "INTERNAL_ERROR");
  }
}
