import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../../../src/context/AuthProvider";
import { useAuth } from "../../../src/hooks/useAuth";
import { authApi } from "../../../src/services/auth/auth-api";
import { ApiError } from "../../../src/services/http/api-client";
import type { PublicUser } from "../../../src/types/auth";

vi.mock("../../../src/services/auth/auth-api", () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    refresh: vi.fn(),
    logout: vi.fn(),
    me: vi.fn(),
    changePassword: vi.fn(),
  },
}));

const mockUser: PublicUser = {
  id: 1,
  firstName: "Pablo",
  lastName: "Lopez",
  email: "uo289642@uniovi.es",
  uo: "UO289642",
  role: "ADMIN",
  isActive: true,
  createdAt: "2026-03-01T10:00:00.000Z",
  updatedAt: "2026-03-10T10:00:00.000Z",
};

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.mocked(authApi.login).mockReset();
    vi.mocked(authApi.register).mockReset();
    vi.mocked(authApi.refresh).mockReset();
    vi.mocked(authApi.logout).mockReset();
    vi.mocked(authApi.changePassword).mockReset();
  });

  it("restores an existing session on mount", async () => {
    vi.mocked(authApi.refresh).mockResolvedValue({
      accessToken: "restored-token",
      user: mockUser,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.status).toBe("authenticated");
    });

    expect(result.current.accessToken).toBe("restored-token");
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAdmin).toBe(true);
  });

  it("clears the session when refresh fails with an ApiError", async () => {
    vi.mocked(authApi.refresh).mockRejectedValue(
      new ApiError({
        statusCode: 401,
        code: "auth.unauthorized",
        message: "Authentication required",
      }),
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.status).toBe("anonymous");
    });

    expect(result.current.user).toBeNull();
    expect(result.current.accessToken).toBeNull();
  });

  it("logs in and registers through the api", async () => {
    vi.mocked(authApi.refresh).mockRejectedValue(new Error("no session"));
    vi.mocked(authApi.login).mockResolvedValue({
      accessToken: "login-token",
      user: mockUser,
    });
    vi.mocked(authApi.register).mockResolvedValue({ user: mockUser });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.status).toBe("anonymous");
    });

    await act(async () => {
      await result.current.login({
        email: "uo289642@uniovi.es",
        password: "12345678",
      });
      await result.current.register({
        firstName: "Pablo",
        lastName: "Lopez",
        email: "uo289642@uniovi.es",
        password: "12345678",
      });
    });

    expect(authApi.login).toHaveBeenCalled();
    expect(authApi.register).toHaveBeenCalled();
    expect(result.current.status).toBe("authenticated");
  });

  it("clears the session even when logout rethrows the api error", async () => {
    vi.mocked(authApi.refresh).mockResolvedValue({
      accessToken: "restored-token",
      user: mockUser,
    });
    vi.mocked(authApi.logout).mockRejectedValue(new Error("logout failed"));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.status).toBe("authenticated");
    });

    let thrownError: unknown;
    await act(async () => {
      try {
        await result.current.logout();
      } catch (error) {
        thrownError = error;
      }
    });

    expect(thrownError).toBeInstanceOf(Error);
    expect((thrownError as Error).message).toBe("logout failed");
    expect(authApi.logout).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe("anonymous");
    expect(result.current.user).toBeNull();
    expect(result.current.accessToken).toBeNull();
  });

  it("changes the password using current token and then logs out", async () => {
    vi.mocked(authApi.refresh).mockResolvedValue({
      accessToken: "restored-token",
      user: mockUser,
    });
    vi.mocked(authApi.changePassword).mockResolvedValue(undefined);
    vi.mocked(authApi.logout).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.status).toBe("authenticated");
    });

    await act(async () => {
      await result.current.changePassword({
        currentPassword: "old-password",
        newPassword: "new-password",
      });
    });

    expect(authApi.changePassword).toHaveBeenCalledWith("restored-token", {
      currentPassword: "old-password",
      newPassword: "new-password",
    });
    expect(authApi.logout).toHaveBeenCalled();
    expect(result.current.status).toBe("anonymous");
  });

  it("throws unauthorized when password change cannot restore a session", async () => {
    vi.mocked(authApi.refresh).mockRejectedValue(new Error("no session"));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.status).toBe("anonymous");
    });

    let thrownError: unknown;
    await act(async () => {
      try {
        await result.current.changePassword({
          currentPassword: "old-password",
          newPassword: "new-password",
        });
      } catch (error) {
        thrownError = error;
      }
    });

    expect(thrownError).toMatchObject({
      status: 401,
      code: "auth.unauthorized",
    });
  });

  it("throws unauthorized when executeWithSession cannot restore any session", async () => {
    vi.mocked(authApi.refresh).mockRejectedValue(new Error("no session"));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.status).toBe("anonymous");
    });

    let thrownError: unknown;
    await act(async () => {
      try {
        await result.current.executeWithSession(async () => "ok");
      } catch (error) {
        thrownError = error;
      }
    });

    expect(thrownError).toMatchObject({
      status: 401,
      code: "auth.unauthorized",
      message: "Authentication required",
    });
  });

  it("executes operations with restored session and retries once after a 401", async () => {
    vi.mocked(authApi.refresh)
      .mockResolvedValueOnce({ accessToken: "first-token", user: mockUser })
      .mockResolvedValueOnce({ accessToken: "second-token", user: mockUser });

    const operation = vi
      .fn<(token: string) => Promise<string>>()
      .mockRejectedValueOnce(
        new ApiError({
          statusCode: 401,
          code: "auth.unauthorized",
          message: "Authentication required",
        }),
      )
      .mockImplementationOnce(async () => "ok");

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.status).toBe("authenticated");
    });

    let value: string | undefined;
    await act(async () => {
      value = await result.current.executeWithSession(operation);
    });

    expect(value).toBe("ok");
    expect(operation).toHaveBeenNthCalledWith(1, "first-token");
    expect(operation).toHaveBeenNthCalledWith(2, "second-token");
  });

  it("clears session and rethrows the original 401 when refresh retry fails", async () => {
    vi.mocked(authApi.refresh)
      .mockResolvedValueOnce({ accessToken: "first-token", user: mockUser })
      .mockRejectedValueOnce(new Error("refresh failed"));

    const operation = vi
      .fn<(token: string) => Promise<string>>()
      .mockRejectedValueOnce(
        new ApiError({
          statusCode: 401,
          code: "auth.unauthorized",
          message: "Authentication required",
        }),
      );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.status).toBe("authenticated");
    });

    let refreshRetryError: unknown;
    await act(async () => {
      try {
        await result.current.executeWithSession(operation);
      } catch (error) {
        refreshRetryError = error;
      }
    });

    expect(refreshRetryError).toMatchObject({
      status: 401,
      code: "auth.unauthorized",
    });
    expect(result.current.status).toBe("anonymous");
    expect(result.current.user).toBeNull();
    expect(result.current.accessToken).toBeNull();
  });

  it("rethrows non-401 errors when the operation fails with an active session", async () => {
    vi.mocked(authApi.refresh).mockResolvedValue({
      accessToken: "first-token",
      user: mockUser,
    });

    const non401Operation = vi.fn(async () => {
      throw new Error("boom");
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.status).toBe("authenticated");
    });

    let non401Error: unknown;
    await act(async () => {
      try {
        await result.current.executeWithSession(non401Operation);
      } catch (error) {
        non401Error = error;
      }
    });

    expect(non401Operation).toHaveBeenCalledWith("first-token");
    expect(non401Error).toBeInstanceOf(Error);
    expect((non401Error as Error).message).toBe("boom");
    expect(result.current.status).toBe("authenticated");
  });
});
