import bcrypt from "bcryptjs";

export class PasswordService {
  public async hash(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  public async verify(password: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(password, passwordHash);
  }
}
