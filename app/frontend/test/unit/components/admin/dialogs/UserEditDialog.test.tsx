import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { describe, expect, it, vi } from "vitest";
import { UserEditDialog } from "../../../../../src/components/admin/dialogs/UserEditDialog";
import { theme } from "../../../../../src/theme";
import type { AdminUser } from "../../../../../src/types/auth";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

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

function renderDialog(
  overrides: Partial<React.ComponentProps<typeof UserEditDialog>> = {},
) {
  return render(
    <ThemeProvider theme={theme}>
      <UserEditDialog
        open
        user={user}
        submitting={false}
        onClose={vi.fn()}
        onSubmit={vi.fn(async () => undefined)}
        {...overrides}
      />
    </ThemeProvider>,
  );
}

describe("UserEditDialog", () => {
  it("returns null when there is no user", () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <UserEditDialog
          open
          user={null}
          submitting={false}
          onClose={vi.fn()}
          onSubmit={vi.fn(async () => undefined)}
        />
      </ThemeProvider>,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("validates the fields and clears field errors when the user edits them", async () => {
    renderDialog();

    fireEvent.change(screen.getByLabelText("auth.firstName"), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByLabelText("auth.lastName"), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByLabelText("auth.email"), {
      target: { value: "invalid@email.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: "common.save" }));

    await waitFor(() => {
      expect(screen.getAllByText("forms.validation.required")).toHaveLength(2);
      expect(
        screen.getByText("forms.validation.unioviEmail"),
      ).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText("auth.firstName"), {
      target: { value: "Ana" },
    });
    fireEvent.change(screen.getByLabelText("auth.lastName"), {
      target: { value: "Llaneza" },
    });
    fireEvent.change(screen.getByLabelText("auth.email"), {
      target: { value: "uo123456@uniovi.es" },
    });

    await waitFor(() => {
      expect(
        screen.queryByText("forms.validation.unioviEmail"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("forms.validation.required"),
      ).not.toBeInTheDocument();
    });
  });

  it("submits trimmed values and the selected role when the form is valid", async () => {
    const onSubmit = vi.fn(async () => undefined);
    renderDialog({ onSubmit });

    fireEvent.change(screen.getByLabelText("auth.firstName"), {
      target: { value: "  Ana  " },
    });
    fireEvent.change(screen.getByLabelText("auth.lastName"), {
      target: { value: "  Llaneza  " },
    });
    fireEvent.change(screen.getByLabelText("auth.email"), {
      target: { value: "  uo123456@uniovi.es  " },
    });

    fireEvent.mouseDown(screen.getByRole("combobox", { name: "common.role" }));
    fireEvent.click(screen.getByRole("option", { name: "roles.TEACHER" }));

    fireEvent.click(screen.getByRole("button", { name: "common.save" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        firstName: "Ana",
        lastName: "Llaneza",
        email: "uo123456@uniovi.es",
        role: "TEACHER",
      });
    });
  });

  it("disables cancel and save while the form is submitting", () => {
    const onClose = vi.fn();
    renderDialog({ submitting: true, onClose });

    expect(
      screen.getByRole("button", { name: "common.cancel" }),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "common.save" })).toBeDisabled();
  });
});
