import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { RequireAuth } from "../../../../src/components/auth/RequireAuth";
import { useAuth } from "../../../../src/hooks/useAuth";
import { describe, expect, it, vi } from "vitest";

vi.mock("../../../../src/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../../../src/components/common/LoadingScreen", () => ({
  LoadingScreen: () => <div>loading-screen</div>,
}));

describe("RequireAuth", () => {
  it("shows the loading screen while the session is loading", () => {
    vi.mocked(useAuth).mockReturnValue({
      status: "loading",
      isAuthenticated: false,
    } as ReturnType<typeof useAuth>);

    render(
      <MemoryRouter>
        <RequireAuth />
      </MemoryRouter>,
    );

    expect(screen.getByText("loading-screen")).toBeInTheDocument();
  });

  it("redirects anonymous users to /login", () => {
    vi.mocked(useAuth).mockReturnValue({
      status: "anonymous",
      isAuthenticated: false,
    } as ReturnType<typeof useAuth>);

    render(
      <MemoryRouter initialEntries={["/profile"]}>
        <Routes>
          <Route element={<RequireAuth />}>
            <Route path="/profile" element={<div>protected-page</div>} />
          </Route>
          <Route path="/login" element={<div>login-page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("login-page")).toBeInTheDocument();
  });

  it("renders the protected route for authenticated users", () => {
    vi.mocked(useAuth).mockReturnValue({
      status: "authenticated",
      isAuthenticated: true,
    } as ReturnType<typeof useAuth>);

    render(
      <MemoryRouter initialEntries={["/profile"]}>
        <Routes>
          <Route element={<RequireAuth />}>
            <Route path="/profile" element={<div>protected-page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("protected-page")).toBeInTheDocument();
  });
});
