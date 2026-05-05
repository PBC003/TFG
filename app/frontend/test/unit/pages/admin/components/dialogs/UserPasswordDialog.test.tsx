import { fireEvent, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { describe, expect, it, vi } from "vitest";
import { UserPasswordDialog } from "../../../../../../src/pages/admin/components/dialogs/UserPasswordDialog";
import type { AdminUser } from "../../../../../../src/types/auth";
import { renderWithProviders } from "../../../../../utils/render";

const user: AdminUser = {
  id: 7,
  firstName: "Pablo",
  lastName: "Carrasco",
  email: "uo289642@uniovi.es",
  uo: "UO289642",
  role: "ADMIN",
  isActive: true,
  createdAt: "2026-03-01T10:00:00.000Z",
  updatedAt: "2026-03-10T10:00:00.000Z",
  lastLoginAt: "2026-03-12T10:00:00.000Z",
};

describe("UserPasswordDialog", () => {
  it("validates the new password before submitting", async () => {
    const onSubmit = vi.fn(async () => undefined);
    renderWithProviders(
      <UserPasswordDialog
        open
        user={user}
        submitting={false}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText("auth.newPassword"), {
      target: { value: "123" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "common.resetPassword" }),
    );

    await waitFor(() => {
      expect(
        screen.getByText("forms.validation.passwordLength"),
      ).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits a valid password and shows user context", async () => {
    const onSubmit = vi.fn(async () => undefined);
    renderWithProviders(
      <UserPasswordDialog
        open
        user={user}
        submitting={false}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    expect(
      screen.getByText("Pablo Carrasco · uo289642@uniovi.es"),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("auth.newPassword"), {
      target: { value: "12345678" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "common.resetPassword" }),
    );

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith("12345678");
    });
  });

  it("clears validation errors on change and hides user context when missing", async () => {
    renderWithProviders(
      <UserPasswordDialog
        open
        user={null}
        submitting={false}
        onClose={vi.fn()}
        onSubmit={vi.fn(async () => undefined)}
      />,
    );

    expect(
      screen.queryByText("Pablo Carrasco · uo289642@uniovi.es"),
    ).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("auth.newPassword"), {
      target: { value: "123" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "common.resetPassword" }),
    );

    await waitFor(() => {
      expect(
        screen.getByText("forms.validation.passwordLength"),
      ).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText("auth.newPassword"), {
      target: { value: "12345678" },
    });

    await waitFor(() => {
      expect(
        screen.queryByText("forms.validation.passwordLength"),
      ).not.toBeInTheDocument();
    });
  });

  it("disables controls while submitting", () => {
    renderWithProviders(
      <UserPasswordDialog
        open
        user={user}
        submitting
        onClose={vi.fn()}
        onSubmit={vi.fn(async () => undefined)}
      />,
    );

    expect(
      screen.getByRole("button", { name: "common.cancel" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "common.resetPassword" }),
    ).toBeDisabled();
  });
});
