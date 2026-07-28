import type { Request, Response } from "express";
import type { ContactService } from "../services/ContactService.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export class ContactController {
  public constructor(private readonly contacts: ContactService) {}

  public create = async (req: Request, res: Response): Promise<Response> => {
    await this.contacts.create(req.body);
    return ApiResponse.message(res, "Message received successfully", 201);
  };
}
