import type { AuthenticatedUser } from "./http.js";

declare global {
  namespace Express {
    interface Request {
      authenticatedUser?: AuthenticatedUser;
      authToken?: string;
      requestId?: string;
    }
  }
}

export {};
