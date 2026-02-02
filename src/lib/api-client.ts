import { clearToken, getToken } from "@/lib/storage";
import type { ApiResponse } from "@/lib/types";

const API_BASE_URL = process.env["NEXT_PUBLIC_API_BASE_URL"] ?? "http://localhost:8080";

export class RequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "RequestError";
  }
}

export const apiRequest = async <T>(
  path: string,
  init?: RequestInit,
  authRequired = true
): Promise<T> => {
  const headers = new Headers(init?.headers ?? {});
  headers.set("Content-Type", "application/json");

  if (authRequired) {
    const token = getToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers
  });

  const body = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok) {
    const message = body?.message || response.statusText || "Request failed";
    if (response.status === 401 && authRequired) {
      clearToken();
    }
    throw new RequestError(message, response.status);
  }

  if (!body) {
    throw new RequestError("Invalid empty response", 500);
  }

  return body.data;
};
