import { beforeEach, describe, expect, it, vi } from "vitest";
import { authApi } from "../../../../src/services/auth/auth-api";
import { request } from "../../../../src/services/http/api-client";

vi.mock("../../../../src/services/http/api-client", () => ({
  request: vi.fn(),
}));

describe("authApi", () => {
  beforeEach(() => {
    vi.mocked(request).mockReset();
  });

  it("calls login endpoint", () => {
    const payload = { email: "uo289642@uniovi.es", password: "12345678" };
    authApi.login(payload);

    expect(request).toHaveBeenCalledWith("/auth/login", {
      method: "POST",
      body: payload,
    });
  });

  it("calls register endpoint", () => {
    const payload = {
      firstName: "Pablo",
      lastName: "Carrasco",
      email: "uo289642@uniovi.es",
      password: "12345678",
    };
    authApi.register(payload);

    expect(request).toHaveBeenCalledWith("/auth/register", {
      method: "POST",
      body: payload,
    });
  });

  it("calls refresh, logout, me and changePassword endpoints", () => {
    authApi.refresh();
    authApi.logout();
    authApi.me("token");
    authApi.changePassword("token", {
      currentPassword: "old-password",
      newPassword: "new-password",
    });

    expect(request).toHaveBeenNthCalledWith(1, "/auth/refresh", {
      method: "POST",
    });
    expect(request).toHaveBeenNthCalledWith(2, "/auth/logout", {
      method: "POST",
    });
    expect(request).toHaveBeenNthCalledWith(3, "/auth/me", {
      accessToken: "token",
    });
    expect(request).toHaveBeenNthCalledWith(4, "/auth/change-password", {
      method: "PATCH",
      accessToken: "token",
      body: {
        currentPassword: "old-password",
        newPassword: "new-password",
      },
    });
  });
});
