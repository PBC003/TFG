import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@mui/material";
import ProfilePage from "../../../src/pages/profile/ProfilePage";
import { AuthContext } from "../../../src/context/AuthContext";
import { theme } from "../../../src/theme";
import { createAuthValue } from "../../utils/auth";

function renderProfilePage(authValue = createAuthValue()) {
  return render(
    <ThemeProvider theme={theme}>
      <AuthContext.Provider value={authValue}>
        <MemoryRouter initialEntries={["/profile"]}>
          <Routes>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/login" element={<div>login-page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    </ThemeProvider>,
  );
}

describe("ProfilePage", () => {
  it("returns null when there is no user", () => {
    const { container } = renderProfilePage(
      createAuthValue({ user: null, isAuthenticated: false }),
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("shows validation errors for invalid password change attempts", async () => {
    const authValue = createAuthValue();
    renderProfilePage(authValue);

    fireEvent.click(
      screen.getByRole("button", { name: "auth.submitPasswordChange" }),
    );

    await waitFor(() => {
      expect(
        screen.getByText("forms.validation.currentPasswordRequired"),
      ).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText("auth.currentPassword"), {
      target: { value: "12345678" },
    });
    fireEvent.change(screen.getByLabelText("auth.newPassword"), {
      target: { value: "12345678" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "auth.submitPasswordChange" }),
    );

    await waitFor(() => {
      expect(
        screen.getByText("forms.validation.samePassword"),
      ).toBeInTheDocument();
    });
  });

  it("changes the password and redirects to login on success", async () => {
    const authValue = createAuthValue({
      changePassword: vi.fn(async () => undefined),
    });
    renderProfilePage(authValue);

    fireEvent.change(screen.getByLabelText("auth.currentPassword"), {
      target: { value: "12345678" },
    });
    fireEvent.change(screen.getByLabelText("auth.newPassword"), {
      target: { value: "87654321" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "auth.submitPasswordChange" }),
    );

    await waitFor(() => {
      expect(authValue.changePassword).toHaveBeenCalledWith({
        currentPassword: "12345678",
        newPassword: "87654321",
      });
    });

    await waitFor(() => {
      expect(screen.getByText("login-page")).toBeInTheDocument();
    });
  });

  it("shows error messages returned by changePassword", async () => {
    const authValue = createAuthValue({
      changePassword: vi.fn(async () => {
        throw new Error("Cambio fallido");
      }),
    });
    renderProfilePage(authValue);

    fireEvent.change(screen.getByLabelText("auth.currentPassword"), {
      target: { value: "12345678" },
    });
    fireEvent.change(screen.getByLabelText("auth.newPassword"), {
      target: { value: "87654321" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "auth.submitPasswordChange" }),
    );

    await waitFor(() => {
      expect(screen.getByText("Cambio fallido")).toBeInTheDocument();
    });
  });
});
