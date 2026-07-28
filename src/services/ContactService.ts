import type { ContactRepository } from "../repositories/ContactRepository.js";
import { Validation } from "../utils/Validation.js";

export class ContactService {
  public constructor(private readonly contacts: ContactRepository) {}

  public create(body: unknown) {
    const data = Validation.object(body, "body");

    return this.contacts.create({
      name: Validation.string(data.name, "name", 2, 120),
      email: Validation.email(data.email),
      message: Validation.string(data.message, "message", 5, 3000)
    });
  }
}
