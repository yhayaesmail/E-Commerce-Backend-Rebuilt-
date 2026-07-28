import type { NextFunction, Request, Response } from "express";
import { Hash } from "../utils/Hash.js";

export class RequestContextMiddleware {
  public handle(req: Request, _res: Response, next: NextFunction): void {
    req.requestId = Hash.uuid();
    next();
  }
}
