import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AppLayout from "../../../../src/components/layout/AppLayout";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@mui/material";
import { AuthContext } from "../../../../src/context/AuthContext";
import { theme } from "../../../../src/theme";
import { createAuthValue } from "../../../utils/auth";

function renderLayout(authValue = createAuthValue(), route = "/") {
  return render(
    <ThemeProvider theme={theme}>
      <AuthContext.Provider value={authValue}>
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<div>home-content</div>} />
              <Route path="profile" element={<div>profile-content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    </ThemeProvider>,
  );
}

describe("AppLayout", () => {
  it("shows guest navigation links", () => {
    const authValue = createAuthValue({
      isAuthenticated: false,
      isAdmin: false,
      status: "anonymous",
      user: null,
    });

    renderLayout(authValue);

    expect(screen.getByRole("link", { name: "nav.home" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("link", { name: "nav.about" })).toHaveAttribute(
      "href",
      "/about",
    );
    expect(screen.getByRole("link", { name: "nav.login" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(screen.getByRole("link", { name: "nav.register" })).toHaveAttribute(
      "href",
      "/register",
    );
  });

  it("shows authenticated navigation links and logs out from desktop menu", async () => {
    const logout = vi.fn(async () => undefined);
    const authValue = createAuthValue({ logout });

    renderLayout(authValue, "/profile");

    expect(screen.getByRole("link", { name: "nav.profile" })).toHaveAttribute(
      "href",
      "/profile",
    );
    expect(screen.getByRole("link", { name: "nav.admin" })).toHaveAttribute(
      "href",
      "/admin",
    );

    fireEvent.click(screen.getAllByRole("button", { name: "nav.logout" })[0]!);

    await waitFor(() => {
      expect(logout).toHaveBeenCalledTimes(1);
    });
  });

  it("opens the mobile drawer and logs out from it", async () => {
    const logout = vi.fn(async () => undefined);
    const authValue = createAuthValue({ logout });

    renderLayout(authValue);

    fireEvent.click(screen.getByTestId("MenuIcon").closest("button")!);

    const mobileLogout = await screen.findByRole("button", {
      name: "nav.logout",
    });
    fireEvent.click(mobileLogout);

    await waitFor(() => {
      expect(logout).toHaveBeenCalledTimes(1);
    });
  });
});
