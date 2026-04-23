import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAdminUsersPage } from "../../../../../src/pages/admin/hooks/useAdminUsersPage";
import { adminApi } from "../../../../../src/services/admin/admin-api";
import { createAuthValue } from "../../../../utils/auth";

const tMock = vi.fn((key: string) => key);

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: tMock }),
}));

vi.mock("../../../../../src/services/admin/admin-api", () => ({
  adminApi: {
    listUsers: vi.fn(),
    updateUser: vi.fn(),
    updateRole: vi.fn(),
    updateStatus: vi.fn(),
    resetPassword: vi.fn(),
    deleteUser: vi.fn(),
  },
}));

vi.mock("../../../../../src/utils/error-code", () => ({
  getErrorMessage: () => "translated-error",
}));

const users = [
  {
    id: 1,
    firstName: "Admin",
    lastName: "One",
    email: "admin@uniovi.es",
    uo: "UO000001",
    role: "ADMIN",
    isActive: true,
    createdAt: "2026-03-01T10:00:00.000Z",
    updatedAt: "2026-03-10T10:00:00.000Z",
    lastLoginAt: null,
  },
  {
    id: 2,
    firstName: "Ana",
    lastName: "Llaneza",
    email: "ana@uniovi.es",
    uo: "UO000002",
    role: "STUDENT",
    isActive: false,
    createdAt: "2026-03-01T10:00:00.000Z",
    updatedAt: "2026-03-10T10:00:00.000Z",
    lastLoginAt: null,
  },
] as const;

describe("useAdminUsersPage", () => {
  let executeWithSession: <T>(
    operation: (accessToken: string) => Promise<T>,
  ) => Promise<T>;
  let auth: ReturnType<typeof createAuthValue>;

  beforeEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    tMock.mockClear();

    executeWithSession = async <T,>(
      operation: (accessToken: string) => Promise<T>,
    ) => operation("token");

    auth = createAuthValue({
      user: { ...createAuthValue().user!, id: 1 },
      executeWithSession,
    });

    vi.mocked(adminApi.listUsers).mockResolvedValue({ users: [...users] });
    vi.mocked(adminApi.updateUser).mockResolvedValue({
      user: { ...users[1], firstName: "Ana Maria" },
    });
    vi.mocked(adminApi.updateRole).mockResolvedValue({
      user: { ...users[1], role: "TEACHER" },
    });
    vi.mocked(adminApi.updateStatus).mockResolvedValue({
      user: { ...users[1], isActive: true },
    });
    vi.mocked(adminApi.resetPassword).mockResolvedValue({
      success: true,
    } as never);
    vi.mocked(adminApi.deleteUser).mockResolvedValue({
      success: true,
    } as never);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("loads users and applies search/status filters", async () => {
    const { result } = renderHook(() => useAdminUsersPage({ auth }));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.visibleUsers).toHaveLength(2);

    act(() => {
      result.current.setSearch("ana");
      result.current.setStatusFilter("inactive");
    });

    expect(result.current.visibleUsers).toHaveLength(1);
  });

  it("handles edit, password and confirm branches including self protection", async () => {
    const { result } = renderHook(() => useAdminUsersPage({ auth }));

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setEditingUser(users[1] as never);
      result.current.setPasswordUser(users[1] as never);
    });

    await act(async () => {
      await result.current.handleEditSubmit({
        firstName: "Ana Maria",
        lastName: "Llaneza",
        email: "ana@uniovi.es",
        role: "TEACHER",
      });
    });

    expect(adminApi.updateUser).toHaveBeenCalled();
    expect(adminApi.updateRole).toHaveBeenCalled();

    await act(async () => {
      await result.current.handlePasswordSubmit("new-password-123");
    });

    expect(adminApi.resetPassword).toHaveBeenCalledWith("token", 2, {
      newPassword: "new-password-123",
    });

    act(() => {
      result.current.setConfirmState({
        type: "toggleStatus",
        user: users[0] as never,
      });
    });

    await act(async () => {
      await result.current.handleConfirmAction();
    });

    expect(result.current.feedback).toEqual({
      severity: "error",
      message: "admin.dialogs.selfProtected",
    });

    act(() => {
      result.current.setConfirmState({
        type: "toggleStatus",
        user: users[1] as never,
      });
    });

    await act(async () => {
      await result.current.handleConfirmAction();
    });

    expect(adminApi.updateStatus).toHaveBeenCalled();

    act(() => {
      result.current.setConfirmState({
        type: "delete",
        user: users[1] as never,
      });
    });

    await act(async () => {
      await result.current.handleConfirmAction();
    });

    expect(adminApi.deleteUser).toHaveBeenCalledWith("token", 2);
  });

  it("stores translated errors for failed loading and mutations", async () => {
    vi.mocked(adminApi.listUsers).mockRejectedValueOnce(new Error("boom-load"));

    const { result } = renderHook(() => useAdminUsersPage({ auth }));

    await waitFor(() =>
      expect(result.current.feedback).toEqual({
        severity: "error",
        message: "translated-error",
      }),
    );

    vi.mocked(adminApi.listUsers).mockResolvedValue({ users: [...users] });

    await act(async () => {
      await result.current.loadUsers("admin.refreshSuccess");
    });

    expect(result.current.feedback).toEqual({
      severity: "success",
      message: "admin.refreshSuccess",
    });
  });
});
