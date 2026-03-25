import { render, screen } from "@testing-library/react";
import {
  AuthContext,
  type AuthContextValue,
} from "../../../src/context/AuthContext";
import { useAuth } from "../../../src/hooks/useAuth";

function Consumer() {
  const auth = useAuth();
  return <div>{auth.user?.email ?? "no-user"}</div>;
}

const authValue: AuthContextValue = {
  accessToken: "token",
  isAuthenticated: true,
  isAdmin: false,
  status: "authenticated",
  user: {
    id: 1,
    firstName: "Pablo",
    lastName: "Carrasco",
    email: "uo123456@uniovi.es",
    uo: "UO123456",
    role: "STUDENT",
    isActive: true,
    createdAt: "2026-03-24T10:00:00.000Z",
    updatedAt: "2026-03-24T10:00:00.000Z",
  },
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  restoreSession: vi.fn(),
  changePassword: vi.fn(),
  executeWithSession: vi.fn(),
};

describe("useAuth", () => {
  it("returns the current auth context", () => {
    render(
      <AuthContext.Provider value={authValue}>
        <Consumer />
      </AuthContext.Provider>,
    );

    expect(screen.getByText("uo123456@uniovi.es")).toBeInTheDocument();
  });

  it("throws when used outside the provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    expect(() => render(<Consumer />)).toThrow(
      "useAuth must be used within an AuthProvider",
    );

    spy.mockRestore();
  });
});
