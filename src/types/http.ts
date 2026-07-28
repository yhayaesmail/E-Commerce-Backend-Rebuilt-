import type { Role } from "@prisma/client";

export type AuthenticatedUser = {
  id: string;
  email: string;
  username: string;
  role: Role;
  sessionId: string;
};

export type PaginationQuery = {
  page?: string;
  limit?: string;
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiFailure = {
  success: false;
  message: string;
  errors?: unknown;
};
