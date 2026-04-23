import { afterEach, describe, expect, it, vi } from "vitest";
import { API_BASE_URL } from "../../../../src/constants/app";
import {
  ApiError,
  request,
  requestText,
} from "../../../../src/services/http/api-client";

describe("api-client", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends JSON requests with auth headers and returns the parsed payload", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      request<{ ok: boolean }>("/groups", {
        method: "POST",
        accessToken: "token-123",
        body: { name: "Group" },
        credentials: "same-origin",
      }),
    ).resolves.toEqual({ ok: true });

    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/groups`, {
      method: "POST",
      headers: expect.any(Headers),
      body: JSON.stringify({ name: "Group" }),
      credentials: "same-origin",
    });

    const headers = fetchMock.mock.calls[0]?.[1]?.headers as Headers;
    expect(headers.get("Content-Type")).toBe("application/json");
    expect(headers.get("Authorization")).toBe("Bearer token-123");
  });

  it("returns undefined for 204 responses", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      request<void>("/groups/group-1", { method: "DELETE" }),
    ).resolves.toBeUndefined();
  });

  it("normalizes JSON error payloads into ApiError instances", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          code: "group.name_already_exists",
          message: "Already exists",
          details: [{ field: "name", message: "Duplicated" }],
        }),
        {
          status: 409,
          statusText: "Conflict",
          headers: { "content-type": "application/json" },
        },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(request("/groups")).rejects.toEqual(
      expect.objectContaining<ApiError>({
        name: "ApiError",
        status: 409,
        code: "group.name_already_exists",
        message: "Already exists",
        details: expect.arrayContaining([
          { field: "name", message: "Duplicated" },
        ]),
      }),
    );
  });

  it("falls back to the response body for non-json failures when present", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("Gateway failed", {
        status: 502,
        statusText: "Bad Gateway",
        headers: { "content-type": "text/plain" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(request("/health")).rejects.toEqual(
      expect.objectContaining<ApiError>({
        name: "ApiError",
        status: 502,
        code: "common.internal_error",
        message: "Gateway failed",
      }),
    );
  });

  it("reads text responses and preserves request defaults", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("csv-content", {
        status: 200,
        headers: { "content-type": "text/csv" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      requestText("/quizzes/export", { accessToken: "token-456" }),
    ).resolves.toBe("csv-content");

    const headers = fetchMock.mock.calls[0]?.[1]?.headers as Headers;
    expect(fetchMock.mock.calls[0]?.[1]).toEqual(
      expect.objectContaining({
        method: "GET",
        body: undefined,
        credentials: "include",
      }),
    );
    expect(headers.get("Authorization")).toBe("Bearer token-456");
  });
});

it("falls back to the response status text when non-json failures have an empty body", async () => {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(null, {
      status: 503,
      statusText: "Service Unavailable",
      headers: { "content-type": "text/plain" },
    }),
  );
  vi.stubGlobal("fetch", fetchMock);

  await expect(request("/health")).rejects.toEqual(
    expect.objectContaining<ApiError>({
      name: "ApiError",
      status: 503,
      code: "common.internal_error",
      message: "Service Unavailable",
    }),
  );
});

it("normalizes object payloads without message/code using the response defaults", async () => {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(JSON.stringify({ details: { reason: "bad" } }), {
      status: 400,
      statusText: "Bad Request",
      headers: { "content-type": "application/json" },
    }),
  );
  vi.stubGlobal("fetch", fetchMock);

  await expect(request("/groups")).rejects.toEqual(
    expect.objectContaining<ApiError>({
      name: "ApiError",
      status: 400,
      code: "common.internal_error",
      message: "Bad Request",
    }),
  );
});
