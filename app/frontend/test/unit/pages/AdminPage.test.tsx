import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as mui from "@mui/material";
import AdminPage from "../../../src/pages/admin/AdminPage";
import { theme } from "../../../src/theme";
import { adminApi } from "../../../src/services/admin/admin-api";
import type { AdminUser } from "../../../src/types/auth";

const { tMock } = vi.hoisted(() => ({
  tMock: vi.fn((key: string) => key),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: tMock,
  }),
}));

vi.mock("../../../src/services/admin/admin-api", () => ({
  adminApi: {
    listUsers: vi.fn(),
    updateUser: vi.fn(),
    updateRole: vi.fn(),
    updateStatus: vi.fn(),
    resetPassword: vi.fn(),
    deleteUser: vi.fn(),
  },
}));

let authValue = {
  user: null as { id: number } | null,
  executeWithSession: vi.fn(
    async <T,>(operation: (token: string) => Promise<T>) =>
      operation("token-123"),
  ),
};

vi.mock("../../../src/hooks/useAuth", () => ({
  useAuth: () => authValue,
}));

vi.mock("../../../src/utils/error-code", () => ({
  getErrorMessage: () => "translated-error",
}));

vi.mock("@mui/material", async () => {
  const actual =
    await vi.importActual<typeof import("@mui/material")>("@mui/material");

  return {
    ...actual,
    useMediaQuery: vi.fn(),
  };
});

vi.mock("../../../src/components/admin/AdminToolbar", () => ({
  AdminToolbar: ({
    totalVisible,
    onSearchChange,
    onStatusFilterChange,
  }: {
    totalVisible: number;
    onSearchChange: (value: string) => void;
    onStatusFilterChange: (value: "all" | "active" | "inactive") => void;
  }) => (
    <div>
      <div>{`toolbar-${totalVisible}`}</div>
      <button onClick={() => onSearchChange("ana")}>search-ana</button>
      <button onClick={() => onStatusFilterChange("inactive")}>
        filter-inactive
      </button>
      <button onClick={() => onStatusFilterChange("all")}>filter-all</button>
    </div>
  ),
}));

vi.mock("../../../src/components/admin/AdminUsersTable", () => ({
  AdminUsersTable: ({
    users,
    onEdit,
    onResetPassword,
    onToggleStatus,
    onDelete,
  }: {
    users: AdminUser[];
    onEdit: (user: AdminUser) => void;
    onResetPassword: (user: AdminUser) => void;
    onToggleStatus: (user: AdminUser) => void;
    onDelete: (user: AdminUser) => void;
  }) => (
    <div>
      <div>{`table-${users.length}`}</div>
      {users.map((user) => (
        <div key={user.id}>
          <span>{`table-user-${user.id}`}</span>
          <button
            onClick={() => onEdit(user)}
          >{`edit-table-${user.id}`}</button>
          <button
            onClick={() => onResetPassword(user)}
          >{`password-table-${user.id}`}</button>
          <button
            onClick={() => onToggleStatus(user)}
          >{`toggle-table-${user.id}`}</button>
          <button
            onClick={() => onDelete(user)}
          >{`delete-table-${user.id}`}</button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock("../../../src/components/admin/AdminUserCards", () => ({
  AdminUserCards: ({
    users,
    onEdit,
    onResetPassword,
    onToggleStatus,
    onDelete,
  }: {
    users: AdminUser[];
    onEdit: (user: AdminUser) => void;
    onResetPassword: (user: AdminUser) => void;
    onToggleStatus: (user: AdminUser) => void;
    onDelete: (user: AdminUser) => void;
  }) => (
    <div>
      <div>{`cards-${users.length}`}</div>
      {users.map((user) => (
        <div key={user.id}>
          <span>{`card-user-${user.id}`}</span>
          <button onClick={() => onEdit(user)}>{`edit-card-${user.id}`}</button>
          <button
            onClick={() => onResetPassword(user)}
          >{`password-card-${user.id}`}</button>
          <button
            onClick={() => onToggleStatus(user)}
          >{`toggle-card-${user.id}`}</button>
          <button
            onClick={() => onDelete(user)}
          >{`delete-card-${user.id}`}</button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock("../../../src/components/admin/dialogs/UserEditDialog", () => ({
  UserEditDialog: ({
    open,
    user,
    onClose,
    onSubmit,
  }: {
    open: boolean;
    user: AdminUser | null;
    onClose: () => void;
    onSubmit: (value: {
      firstName: string;
      lastName: string;
      email: string;
      role: AdminUser["role"];
    }) => Promise<void>;
  }) => (
    <div>
      <div data-testid="edit-state">
        {open ? `edit-open-${user?.id}` : "edit-closed"}
      </div>
      <button onClick={onClose}>close-edit</button>
      <button
        onClick={() =>
          void onSubmit({
            firstName: `${user?.firstName ?? "User"} Updated`,
            lastName: user?.lastName ?? "Last",
            email: `updated-${user?.id ?? 0}@uniovi.es`,
            role: user?.role === "TEACHER" ? "STUDENT" : "TEACHER",
          })
        }
      >
        submit-edit-changed
      </button>
      <button
        onClick={() =>
          void onSubmit({
            firstName: user?.firstName ?? "Ana",
            lastName: user?.lastName ?? "Llaneza",
            email: user?.email ?? "uo123456@uniovi.es",
            role: user?.role ?? "STUDENT",
          })
        }
      >
        submit-edit-same
      </button>
    </div>
  ),
}));

vi.mock("../../../src/components/admin/dialogs/UserPasswordDialog", () => ({
  UserPasswordDialog: ({
    open,
    user,
    onClose,
    onSubmit,
  }: {
    open: boolean;
    user: AdminUser | null;
    onClose: () => void;
    onSubmit: (value: string) => Promise<void>;
  }) => (
    <div>
      <div data-testid="password-state">
        {open ? `password-open-${user?.id}` : "password-closed"}
      </div>
      <button onClick={onClose}>close-password</button>
      <button onClick={() => void onSubmit("new-password-123")}>
        submit-password
      </button>
    </div>
  ),
}));

vi.mock("../../../src/components/admin/dialogs/UserConfirmDialog", () => ({
  UserConfirmDialog: ({
    open,
    title,
    description,
    confirmLabel,
    confirmColor,
    onClose,
    onConfirm,
  }: {
    open: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    confirmColor: string;
    onClose: () => void;
    onConfirm: () => Promise<void>;
  }) => (
    <div>
      <div data-testid="confirm-state">
        {open ? "confirm-open" : "confirm-closed"}
      </div>
      <div>{title}</div>
      <div>{description}</div>
      <div>{confirmLabel}</div>
      <div>{confirmColor}</div>
      <button onClick={onClose}>close-confirm</button>
      <button onClick={() => void onConfirm()}>confirm-action</button>
    </div>
  ),
}));

const mockedUseMediaQuery = vi.mocked(mui.useMediaQuery);

const users: AdminUser[] = [
  {
    id: 1,
    firstName: "Pablo",
    lastName: "Lopez",
    email: "uo111111@uniovi.es",
    uo: "UO111111",
    role: "ADMIN",
    isActive: true,
    createdAt: "2026-03-01T10:00:00.000Z",
    updatedAt: "2026-03-10T10:00:00.000Z",
    lastLoginAt: "2026-03-12T10:00:00.000Z",
  },
  {
    id: 2,
    firstName: "Ana",
    lastName: "Llaneza",
    email: "uo123456@uniovi.es",
    uo: "UO123456",
    role: "STUDENT",
    isActive: false,
    createdAt: "2026-03-02T10:00:00.000Z",
    updatedAt: "2026-03-11T10:00:00.000Z",
    lastLoginAt: null,
  },
];

function renderAdminPage() {
  return render(
    <ThemeProvider theme={theme}>
      <AdminPage />
    </ThemeProvider>,
  );
}

describe("AdminPage", () => {
  beforeEach(() => {
    tMock.mockImplementation((key: string) => key);

    authValue = {
      user: { id: 1 },
      executeWithSession: vi.fn(
        async <T,>(operation: (token: string) => Promise<T>) =>
          operation("token-123"),
      ),
    };

    mockedUseMediaQuery.mockReset();
    vi.mocked(adminApi.listUsers).mockReset();
    vi.mocked(adminApi.updateUser).mockReset();
    vi.mocked(adminApi.updateRole).mockReset();
    vi.mocked(adminApi.updateStatus).mockReset();
    vi.mocked(adminApi.resetPassword).mockReset();
    vi.mocked(adminApi.deleteUser).mockReset();
  });

  it("loads desktop data and refreshes the list", async () => {
    mockedUseMediaQuery.mockReturnValue(false);
    vi.mocked(adminApi.listUsers)
      .mockResolvedValueOnce({ users })
      .mockResolvedValueOnce({ users: [users[0]!] });

    renderAdminPage();

    await waitFor(() => {
      expect(screen.getByText("table-2")).toBeInTheDocument();
      expect(screen.getByText("toolbar-2")).toBeInTheDocument();
      expect(adminApi.listUsers).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(screen.getByRole("button", { name: "common.refresh" }));

    await waitFor(() => {
      expect(adminApi.listUsers).toHaveBeenCalledTimes(2);
      expect(screen.getByText("table-1")).toBeInTheDocument();
      expect(screen.getByText("admin.refreshSuccess")).toBeInTheDocument();
    });
  });

  it("edits a user, resets password and closes dialogs", async () => {
    mockedUseMediaQuery.mockReturnValue(false);
    vi.mocked(adminApi.listUsers).mockResolvedValue({ users });
    vi.mocked(adminApi.updateUser).mockResolvedValue({
      user: {
        ...users[0]!,
        firstName: "Pablo Updated",
        email: "updated-1@uniovi.es",
      },
    });
    vi.mocked(adminApi.updateRole).mockResolvedValue({
      user: {
        ...users[0]!,
        firstName: "Pablo Updated",
        email: "updated-1@uniovi.es",
        role: "TEACHER",
      },
    });
    vi.mocked(adminApi.resetPassword).mockResolvedValue(undefined);

    renderAdminPage();

    await waitFor(() => {
      expect(screen.getByText("table-2")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "edit-table-1" }));
    await waitFor(() => {
      expect(screen.getByTestId("edit-state")).toHaveTextContent("edit-open-1");
    });

    fireEvent.click(
      screen.getByRole("button", { name: "submit-edit-changed" }),
    );

    await waitFor(() => {
      expect(adminApi.updateUser).toHaveBeenCalledWith("token-123", 1, {
        firstName: "Pablo Updated",
        lastName: "Lopez",
        email: "updated-1@uniovi.es",
      });
      expect(adminApi.updateRole).toHaveBeenCalledWith("token-123", 1, {
        role: "TEACHER",
      });
      expect(screen.getByText("admin.updateSuccess")).toBeInTheDocument();
      expect(screen.getByTestId("edit-state")).toHaveTextContent("edit-closed");
    });

    fireEvent.click(screen.getByRole("button", { name: "edit-table-2" }));
    await waitFor(() => {
      expect(screen.getByTestId("edit-state")).toHaveTextContent("edit-open-2");
    });
    fireEvent.click(screen.getByRole("button", { name: "close-edit" }));
    await waitFor(() => {
      expect(screen.getByTestId("edit-state")).toHaveTextContent("edit-closed");
    });

    fireEvent.click(screen.getByRole("button", { name: "password-table-1" }));
    await waitFor(() => {
      expect(screen.getByTestId("password-state")).toHaveTextContent(
        "password-open-1",
      );
    });

    fireEvent.click(screen.getByRole("button", { name: "submit-password" }));

    await waitFor(() => {
      expect(adminApi.resetPassword).toHaveBeenCalledWith("token-123", 1, {
        newPassword: "new-password-123",
      });
      expect(screen.getByText("admin.passwordSuccess")).toBeInTheDocument();
      expect(screen.getByTestId("password-state")).toHaveTextContent(
        "password-closed",
      );
    });

    fireEvent.click(screen.getByRole("button", { name: "password-table-2" }));
    await waitFor(() => {
      expect(screen.getByTestId("password-state")).toHaveTextContent(
        "password-open-2",
      );
    });
    fireEvent.click(screen.getByRole("button", { name: "close-password" }));
    await waitFor(() => {
      expect(screen.getByTestId("password-state")).toHaveTextContent(
        "password-closed",
      );
    });
  });

  it("covers guard clauses plus error and empty states", async () => {
    mockedUseMediaQuery.mockReturnValue(false);
    vi.mocked(adminApi.listUsers)
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValueOnce({ users: [] });

    renderAdminPage();

    await waitFor(() => {
      expect(screen.getByText("translated-error")).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByRole("button", { name: "submit-edit-changed" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "submit-password" }));
    fireEvent.click(screen.getByRole("button", { name: "confirm-action" }));

    expect(adminApi.updateUser).not.toHaveBeenCalled();
    expect(adminApi.updateRole).not.toHaveBeenCalled();
    expect(adminApi.resetPassword).not.toHaveBeenCalled();
    expect(adminApi.updateStatus).not.toHaveBeenCalled();
    expect(adminApi.deleteUser).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "common.refresh" }));

    await waitFor(() => {
      expect(screen.getByText("admin.empty")).toBeInTheDocument();
    });
  });

  it("covers mobile toggle flow, self-protection and delete", async () => {
    mockedUseMediaQuery.mockReturnValue(true);
    vi.mocked(adminApi.listUsers).mockResolvedValue({ users });
    vi.mocked(adminApi.updateStatus).mockResolvedValue({
      user: { ...users[1]!, isActive: true },
    });
    vi.mocked(adminApi.deleteUser).mockResolvedValue(undefined);

    renderAdminPage();

    await waitFor(() => {
      expect(screen.getByText("cards-2")).toBeInTheDocument();
      expect(adminApi.listUsers).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(screen.getByRole("button", { name: "toggle-card-2" }));
    await waitFor(() => {
      expect(screen.getByTestId("confirm-state")).toHaveTextContent(
        "confirm-open",
      );
      expect(
        screen.getByText("admin.dialogs.activateTitle"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("admin.dialogs.activateDescription"),
      ).toBeInTheDocument();
      expect(screen.getByText("common.activate")).toBeInTheDocument();
      expect(screen.getByText("success")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "close-confirm" }));
    await waitFor(() => {
      expect(screen.getByTestId("confirm-state")).toHaveTextContent(
        "confirm-closed",
      );
    });

    fireEvent.click(screen.getByRole("button", { name: "toggle-card-2" }));
    fireEvent.click(screen.getByRole("button", { name: "confirm-action" }));

    await waitFor(() => {
      expect(adminApi.updateStatus).toHaveBeenCalledWith("token-123", 2, {
        isActive: true,
      });
      expect(screen.getByText("admin.statusSuccess")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "delete-card-1" }));
    await waitFor(() => {
      expect(screen.getByText("admin.dialogs.deleteTitle")).toBeInTheDocument();
      expect(screen.getByText("common.delete")).toBeInTheDocument();
      expect(screen.getByText("error")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "confirm-action" }));

    await waitFor(() => {
      expect(adminApi.deleteUser).not.toHaveBeenCalled();
      expect(
        screen.getByText("admin.dialogs.selfProtected"),
      ).toBeInTheDocument();
      expect(screen.getByTestId("confirm-state")).toHaveTextContent(
        "confirm-closed",
      );
    });

    fireEvent.click(screen.getByRole("button", { name: "delete-card-2" }));
    await waitFor(() => {
      expect(screen.getByTestId("confirm-state")).toHaveTextContent(
        "confirm-open",
      );
    });
    fireEvent.click(screen.getByRole("button", { name: "confirm-action" }));

    await waitFor(() => {
      expect(adminApi.deleteUser).toHaveBeenCalledWith("token-123", 2);
      expect(screen.getByText("admin.deleteSuccess")).toBeInTheDocument();
      expect(screen.getByText("cards-1")).toBeInTheDocument();
    });
  });

  it("shows translated edit and confirm errors", async () => {
    mockedUseMediaQuery.mockReturnValue(false);
    vi.mocked(adminApi.listUsers).mockResolvedValue({ users });
    vi.mocked(adminApi.updateUser).mockRejectedValue(new Error("edit failed"));
    vi.mocked(adminApi.updateStatus).mockRejectedValue(
      new Error("status failed"),
    );

    renderAdminPage();

    await waitFor(() => {
      expect(screen.getByText("table-2")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "edit-table-1" }));
    await waitFor(() => {
      expect(screen.getByTestId("edit-state")).toHaveTextContent("edit-open-1");
    });
    fireEvent.click(
      screen.getByRole("button", { name: "submit-edit-changed" }),
    );

    await waitFor(() => {
      expect(adminApi.updateUser).toHaveBeenCalled();
      expect(screen.getByText("translated-error")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "toggle-table-2" }));
    await waitFor(() => {
      expect(screen.getByTestId("confirm-state")).toHaveTextContent(
        "confirm-open",
      );
    });
    fireEvent.click(screen.getByRole("button", { name: "confirm-action" }));

    await waitFor(() => {
      expect(adminApi.updateStatus).toHaveBeenCalledWith("token-123", 2, {
        isActive: true,
      });
      expect(screen.getByText("translated-error")).toBeInTheDocument();
    });
  });
});
