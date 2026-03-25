import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, request } from "../../../../src/services/http/api-client";

describe("request", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("performs a default GET request with include credentials", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    await expect(request("/health")).resolves.toEqual({ ok: true });
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3001/health",
      expect.objectContaining({
        method: "GET",
        credentials: "include",
        body: undefined,
      }),
    );
  });

  it("sends json body and authorization header when provided", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ created: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    await request("/auth/login", {
      method: "POST",
      body: { email: "uo289642@uniovi.es" },
      accessToken: "token-123",
      credentials: "same-origin",
    });

    const options = vi.mocked(fetch).mock.calls[0]?.[1];
    expect(options).toMatchObject({
      method: "POST",
      body: JSON.stringify({ email: "uo289642@uniovi.es" }),
      credentials: "same-origin",
    });

    const headers = options?.headers as Headers;
    expect(headers.get("Content-Type")).toBe("application/json");
    expect(headers.get("Authorization")).toBe("Bearer token-123");
  });

  it("returns undefined for 204 responses", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(null, {
        status: 204,
      }),
    );

    await expect(request<void>("/logout", { method: "POST" })).resolves.toBe(
      undefined,
    );
  });

  it("throws a normalized ApiError from json responses", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({ code: "auth.unauthorized", message: "No autorizado" }),
        {
          status: 401,
          statusText: "Unauthorized",
          headers: { "content-type": "application/json" },
        },
      ),
    );

    await expect(request("/auth/me")).rejects.toMatchObject({
      name: "ApiError",
      status: 401,
      code: "auth.unauthorized",
      message: "No autorizado",
    });
  });

  it("normalizes plain text error bodies", async () => {
    const buildErrorResponse = () =>
      new Response("Server exploded", {
        status: 500,
        statusText: "Server Error",
        headers: { "content-type": "text/plain" },
      });

    vi.mocked(fetch).mockImplementation(async () => buildErrorResponse());

    await expect(request("/boom")).rejects.toBeInstanceOf(ApiError);
    await expect(request("/boom")).rejects.toMatchObject({
      status: 500,
      code: "common.internal_error",
      message: "Server exploded",
    });
  });

  it("falls back to the response status text when the error body is empty", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(null, {
        status: 503,
        statusText: "Service Unavailable",
      }),
    );

    await expect(request("/downstream")).rejects.toMatchObject({
      status: 503,
      code: "common.internal_error",
      message: "Service Unavailable",
    });
  });
});
