import type { Response } from "express";

export class ApiResponse {
  public static ok<T>(res: Response, data: T, statusCode = 200): Response {
    return res.status(statusCode).json({
      success: true,
      data
    });
  }

  public static created<T>(res: Response, data: T): Response {
    return this.ok(res, data, 201);
  }

  public static message(res: Response, message: string, statusCode = 200): Response {
    return res.status(statusCode).json({
      success: true,
      message
    });
  }
}
