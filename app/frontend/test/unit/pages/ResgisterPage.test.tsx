import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@mui/material";
import RegisterPage from "../../../src/pages/RegisterPage";
import { AuthContext } from "../../../src/context/AuthContext";
import { theme } from "../../../src/theme";
import { createAuthValue } from "../../utils/auth";

function renderRegisterPage(authValue = createAuthValue()) {
  return render(
    <ThemeProvider theme={theme}>
      <AuthContext.Provider value={authValue}>
        <MemoryRouter initialEntries={["/register"]}>
          <Routes>
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<div>login-page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    </ThemeProvider>,
  );
}

describe("RegisterPage", () => {
  it("validates the form before submitting", async () => {
    const authValue = createAuthValue({
      register: vi.fn(async () => undefined),
    });
    renderRegisterPage(authValue);

    fireEvent.click(
      screen.getByRole("button", { name: "auth.submitRegister" }),
    );

    await waitFor(() => {
      expect(
        screen.getAllByText("forms.validation.required").length,
      ).toBeGreaterThan(0);
    });
    expect(authValue.register).not.toHaveBeenCalled();
  });

  it("registers and redirects to login page on success", async () => {
    const authValue = createAuthValue({
      register: vi.fn(async () => undefined),
    });
    renderRegisterPage(authValue);

    fireEvent.change(screen.getByLabelText("auth.firstName"), {
      target: { value: "Pablo" },
    });
    fireEvent.change(screen.getByLabelText("auth.lastName"), {
      target: { value: "Carrasco" },
    });
    fireEvent.change(screen.getByLabelText("auth.email"), {
      target: { value: "uo289642@uniovi.es" },
    });
    fireEvent.change(screen.getByLabelText("auth.password"), {
      target: { value: "12345678" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "auth.submitRegister" }),
    );

    await waitFor(() => {
      expect(authValue.register).toHaveBeenCalledWith({
        firstName: "Pablo",
        lastName: "Carrasco",
        email: "uo289642@uniovi.es",
        password: "12345678",
      });
    });

    await waitFor(() => {
      expect(screen.getByText("login-page")).toBeInTheDocument();
    });
  });

  it("shows api error messages on failure", async () => {
    const authValue = createAuthValue({
      register: vi.fn(async () => {
        throw new Error("Registro fallido");
      }),
    });
    renderRegisterPage(authValue);

    fireEvent.change(screen.getByLabelText("auth.firstName"), {
      target: { value: "Pablo" },
    });
    fireEvent.change(screen.getByLabelText("auth.lastName"), {
      target: { value: "Carrasco" },
    });
    fireEvent.change(screen.getByLabelText("auth.email"), {
      target: { value: "uo289642@uniovi.es" },
    });
    fireEvent.change(screen.getByLabelText("auth.password"), {
      target: { value: "12345678" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "auth.submitRegister" }),
    );

    await waitFor(() => {
      expect(screen.getByText("Registro fallido")).toBeInTheDocument();
    });
  });
});
