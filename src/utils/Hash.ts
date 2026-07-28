import { createHash, randomUUID } from "node:crypto";

export class Hash {
  public static sha256(value: string): string {
    return createHash("sha256").update(value).digest("hex");
  }

  public static uuid(): string {
    return randomUUID();
  }
}
