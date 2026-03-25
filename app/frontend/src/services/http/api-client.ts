import { API_BASE_URL } from "../../constants/app";
import type { ApiErrorDetails, ApiErrorResponse } from "../../types/api";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: ApiErrorDetails;

  constructor(response: ApiErrorResponse) {
    super(response.message);
    this.name = "ApiError";
    this.status = response.statusCode;
    this.code = response.code;
    this.details = response.details;
  }
}

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

export interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  accessToken?: string | null;
  credentials?: RequestCredentials;
}

async function readBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text ? { message: text } : null;
}

function normalizeError(
  payload: unknown,
  response: Response,
): ApiErrorResponse {
  if (payload && typeof payload === "object") {
    const candidate = payload as Partial<ApiErrorResponse>;

    return {
      statusCode: response.status,
      code: candidate.code ?? "common.internal_error",
      message: candidate.message ?? response.statusText ?? "Unexpected error",
      details: candidate.details,
      path: candidate.path,
      timestamp: candidate.timestamp,
    };
  }

  return {
    statusCode: response.status,
    code: "common.internal_error",
    message: response.statusText || "Unexpected error",
  };
}

export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers = new Headers();
  const hasBody = options.body !== undefined;

  if (hasBody) {
    headers.set("Content-Type", "application/json");
  }

  if (options.accessToken) {
    headers.set("Authorization", `Bearer ${options.accessToken}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: hasBody ? JSON.stringify(options.body) : undefined,
    credentials: options.credentials ?? "include",
  });

  if (!response.ok) {
    throw new ApiError(normalizeError(await readBody(response), response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await readBody(response)) as T;
}
