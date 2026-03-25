import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { RequireGuest } from "../../../../src/components/auth/RequireGuest";
import { useAuth } from "../../../../src/hooks/useAuth";

vi.mock("../../../../src/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../../../src/components/common/LoadingScreen", () => ({
  LoadingScreen: () => <div>loading-screen</div>,
}));

describe("RequireGuest", () => {
  it("shows the loading screen while auth is unresolved", () => {
    vi.mocked(useAuth).mockReturnValue({
      status: "loading",
      isAuthenticated: false,
    } as ReturnType<typeof useAuth>);

    render(<RequireGuest />);

    expect(screen.getByText("loading-screen")).toBeInTheDocument();
  });

  it("redirects authenticated users to the home route", () => {
    vi.mocked(useAuth).mockReturnValue({
      status: "authenticated",
      isAuthenticated: true,
    } as ReturnType<typeof useAuth>);

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route element={<RequireGuest />}>
            <Route path="/login" element={<div>login-page</div>} />
          </Route>
          <Route path="/" element={<div>home-page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("home-page")).toBeInTheDocument();
  });

  it("renders guest-only routes for anonymous users", () => {
    vi.mocked(useAuth).mockReturnValue({
      status: "anonymous",
      isAuthenticated: false,
    } as ReturnType<typeof useAuth>);

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route element={<RequireGuest />}>
            <Route path="/login" element={<div>login-page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("login-page")).toBeInTheDocument();
  });
});
