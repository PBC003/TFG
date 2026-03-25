import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AdminUsersTable } from "../../../../src/components/admin/AdminUsersTable";
import type { AdminUser } from "../../../../src/types/auth";
import { renderWithProviders } from "../../../utils/render";

const users: AdminUser[] = [
  {
    id: 1,
    firstName: "Pablo",
    lastName: "Carrasco",
    email: "uo289642@uniovi.es",
    uo: "UO289642",
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
    role: "TEACHER",
    isActive: false,
    createdAt: "2026-03-01T10:00:00.000Z",
    updatedAt: "2026-03-10T10:00:00.000Z",
    lastLoginAt: null,
  },
];

describe("AdminUsersTable", () => {
  it("renders table rows and delegates actions", () => {
    const onEdit = vi.fn();
    const onResetPassword = vi.fn();
    const onToggleStatus = vi.fn();
    const onDelete = vi.fn();

    renderWithProviders(
      <AdminUsersTable
        currentUserId={1}
        users={users}
        onEdit={onEdit}
        onResetPassword={onResetPassword}
        onToggleStatus={onToggleStatus}
        onDelete={onDelete}
      />,
    );

    expect(screen.getByText("admin.table.user")).toBeInTheDocument();
    expect(screen.getByText("Ana Llaneza")).toBeInTheDocument();
    expect(screen.getByText("(profile.title)")).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "common.edit" })[1]!);
    fireEvent.click(
      screen.getAllByRole("button", { name: "common.resetPassword" })[1]!,
    );
    fireEvent.click(screen.getByRole("button", { name: "common.activate" }));
    fireEvent.click(
      screen.getAllByRole("button", { name: "common.delete" })[1]!,
    );

    expect(onEdit).toHaveBeenCalledWith(users[1]);
    expect(onResetPassword).toHaveBeenCalledWith(users[1]);
    expect(onToggleStatus).toHaveBeenCalledWith(users[1]);
    expect(onDelete).toHaveBeenCalledWith(users[1]);

    expect(
      screen.getAllByRole("button", { name: "common.deactivate" })[0],
    ).toBeDisabled();
  });
});
