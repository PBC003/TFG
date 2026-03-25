import { beforeEach, describe, expect, it, vi } from "vitest";
import { adminApi } from "../../../../src/services/admin/admin-api";
import { request } from "../../../../src/services/http/api-client";

vi.mock("../../../../src/services/http/api-client", () => ({
  request: vi.fn(),
}));

describe("adminApi", () => {
  beforeEach(() => {
    vi.mocked(request).mockReset();
  });

  it("calls all user management endpoints with the expected payload", () => {
    adminApi.listUsers("token");
    adminApi.updateUser("token", 7, { firstName: "Nuevo" });
    adminApi.updateRole("token", 7, { role: "TEACHER" });
    adminApi.updateStatus("token", 7, { isActive: false });
    adminApi.resetPassword("token", 7, { newPassword: "12345678" });
    adminApi.deleteUser("token", 7);

    expect(request).toHaveBeenNthCalledWith(1, "/users", {
      accessToken: "token",
    });
    expect(request).toHaveBeenNthCalledWith(2, "/users/7", {
      method: "PATCH",
      accessToken: "token",
      body: { firstName: "Nuevo" },
    });
    expect(request).toHaveBeenNthCalledWith(3, "/users/7/role", {
      method: "PATCH",
      accessToken: "token",
      body: { role: "TEACHER" },
    });
    expect(request).toHaveBeenNthCalledWith(4, "/users/7/status", {
      method: "PATCH",
      accessToken: "token",
      body: { isActive: false },
    });
    expect(request).toHaveBeenNthCalledWith(5, "/users/7/password", {
      method: "PATCH",
      accessToken: "token",
      body: { newPassword: "12345678" },
    });
    expect(request).toHaveBeenNthCalledWith(6, "/users/7", {
      method: "DELETE",
      accessToken: "token",
    });
  });
});
