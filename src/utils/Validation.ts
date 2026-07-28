import { ErrorFactory } from "../errors/ErrorFactory.js";

export class Validation {
  public static string(value: unknown, field: string, min = 1, max = 255): string {
    if (typeof value !== "string") {
      throw ErrorFactory.badRequest(`${field} must be a string`);
    }

    const trimmed = value.trim();

    if (trimmed.length < min || trimmed.length > max) {
      throw ErrorFactory.badRequest(`${field} must be between ${min} and ${max} characters`);
    }

    return trimmed;
  }

  public static email(value: unknown): string {
    const email = this.string(value, "email", 5, 255).toLowerCase();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!isValid) {
      throw ErrorFactory.badRequest("email is invalid");
    }

    return email;
  }

  public static password(value: unknown): string {
    const password = this.string(value, "password", 8, 128);

    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      throw ErrorFactory.badRequest("password must contain letters and numbers");
    }

    return password;
  }

  public static positiveInteger(value: unknown, field: string, fallback?: number): number {
    if (value === undefined && fallback !== undefined) {
      return fallback;
    }

    const parsed = Number(value);

    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw ErrorFactory.badRequest(`${field} must be a positive integer`);
    }

    return parsed;
  }

  public static nonNegativeInteger(value: unknown, field: string, fallback?: number): number {
    if (value === undefined && fallback !== undefined) {
      return fallback;
    }

    const parsed = Number(value);

    if (!Number.isInteger(parsed) || parsed < 0) {
      throw ErrorFactory.badRequest(`${field} must be a non-negative integer`);
    }

    return parsed;
  }

  public static nonNegativeNumber(value: unknown, field: string): number {
    const parsed = Number(value);

    if (!Number.isFinite(parsed) || parsed < 0) {
      throw ErrorFactory.badRequest(`${field} must be a non-negative number`);
    }

    return parsed;
  }

  public static object(value: unknown, field: string): Record<string, unknown> {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw ErrorFactory.badRequest(`${field} must be an object`);
    }

    return value as Record<string, unknown>;
  }
}
