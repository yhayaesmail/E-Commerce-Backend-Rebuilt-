import { AppError } from "./AppError.js";

export class ErrorFactory {
  public static badRequest(message: string, details?: unknown): AppError {
    return new AppError(message, 400, "BAD_REQUEST", details);
  }

  public static unauthorized(message = "Authentication required"): AppError {
    return new AppError(message, 401, "UNAUTHORIZED");
  }

  public static forbidden(message = "Access denied"): AppError {
    return new AppError(message, 403, "FORBIDDEN");
  }

  public static notFound(message = "Resource not found"): AppError {
    return new AppError(message, 404, "NOT_FOUND");
  }

  public static conflict(message: string): AppError {
    return new AppError(message, 409, "CONFLICT");
  }
}
