import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { RequireRole } from "../../../../src/components/auth/RequireRole";
import { useAuth } from "../../../../src/hooks/useAuth";

vi.mock("../../../../src/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../../../src/components/common/LoadingScreen", () => ({
  LoadingScreen: () => <div>loading-screen</div>,
}));

describe("RequireRole", () => {
  it("shows the loading screen while auth is loading", () => {
    vi.mocked(useAuth).mockReturnValue({
      status: "loading",
      isAuthenticated: false,
    } as ReturnType<typeof useAuth>);

    render(<RequireRole allowedRoles={["ADMIN"]} />);

    expect(screen.getByText("loading-screen")).toBeInTheDocument();
  });

  it("redirects anonymous users to /login", () => {
    vi.mocked(useAuth).mockReturnValue({
      status: "anonymous",
      isAuthenticated: false,
    } as ReturnType<typeof useAuth>);

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route element={<RequireRole allowedRoles={["ADMIN"]} />}>
            <Route path="/admin" element={<div>admin-page</div>} />
          </Route>
          <Route path="/login" element={<div>login-page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("login-page")).toBeInTheDocument();
  });

  it("redirects authenticated users without the required role to /unauthorized", () => {
    vi.mocked(useAuth).mockReturnValue({
      status: "authenticated",
      isAuthenticated: true,
      user: { role: "STUDENT" },
    } as ReturnType<typeof useAuth>);

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route element={<RequireRole allowedRoles={["ADMIN"]} />}>
            <Route path="/admin" element={<div>admin-page</div>} />
          </Route>
          <Route path="/unauthorized" element={<div>unauthorized-page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("unauthorized-page")).toBeInTheDocument();
  });

  it("renders the protected route when the user has an allowed role", () => {
    vi.mocked(useAuth).mockReturnValue({
      status: "authenticated",
      isAuthenticated: true,
      user: { role: "ADMIN" },
    } as ReturnType<typeof useAuth>);

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route element={<RequireRole allowedRoles={["ADMIN"]} />}>
            <Route path="/admin" element={<div>admin-page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("admin-page")).toBeInTheDocument();
  });
});
