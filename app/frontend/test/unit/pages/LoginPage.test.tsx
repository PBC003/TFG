import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "../../../src/pages/LoginPage";
import { AuthContext } from "../../../src/context/AuthContext";
import { ApiError } from "../../../src/services/http/api-client";
import { ROUTES } from "../../../src/constants/routes";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const navigateMock = vi.fn();
let mockedLocationState: unknown = null;

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );

  return {
    ...actual,
    useNavigate: () => navigateMock,
    useLocation: () => ({
      pathname: "/login",
      search: "",
      hash: "",
      state: mockedLocationState,
      key: "test-location",
    }),
  };
});

vi.mock("../../../src/utils/error-code", () => ({
  getErrorMessage: () => "translated-error",
}));

const loginMock =
  vi.fn<(payload: { email: string; password: string }) => Promise<void>>();

const authValue = {
  accessToken: null,
  isAuthenticated: false,
  isAdmin: false,
  status: "anonymous" as const,
  user: null,
  login: loginMock,
  register: vi.fn(),
  logout: vi.fn(),
  restoreSession: vi.fn(),
  changePassword: vi.fn(),
  executeWithSession: vi.fn(),
};

function renderLoginPage() {
  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe("LoginPage", () => {
  beforeEach(() => {
    mockedLocationState = null;
    navigateMock.mockReset();
    loginMock.mockReset();
  });

  it("shows the success message from navigation state", () => {
    mockedLocationState = {
      successMessage: "account-created",
    };

    renderLoginPage();

    expect(screen.getByText("account-created")).toBeInTheDocument();
  });

  it("validates the form before submitting", async () => {
    renderLoginPage();

    fireEvent.change(screen.getByLabelText("auth.email"), {
      target: { value: "bad@email.com" },
    });
    fireEvent.change(screen.getByLabelText("auth.password"), {
      target: { value: "123" },
    });

    fireEvent.click(screen.getByRole("button", { name: "auth.submitLogin" }));

    await waitFor(() => {
      expect(
        screen.getByText("forms.validation.unioviEmail"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("forms.validation.passwordLength"),
      ).toBeInTheDocument();
    });
    expect(loginMock).not.toHaveBeenCalled();
  });

  it("logs in with trimmed email and redirects to the requested route", async () => {
    mockedLocationState = {
      from: {
        pathname: ROUTES.profile,
      },
    };
    loginMock.mockResolvedValue(undefined);

    renderLoginPage();

    fireEvent.change(screen.getByLabelText("auth.email"), {
      target: { value: "  uo123456@uniovi.es  " },
    });
    fireEvent.change(screen.getByLabelText("auth.password"), {
      target: { value: "12345678" },
    });

    fireEvent.click(screen.getByRole("button", { name: "auth.submitLogin" }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({
        email: "uo123456@uniovi.es",
        password: "12345678",
      });
      expect(navigateMock).toHaveBeenCalledWith(ROUTES.profile, {
        replace: true,
      });
    });
  });

  it("redirects to home when no previous route exists", async () => {
    loginMock.mockResolvedValue(undefined);

    renderLoginPage();

    fireEvent.change(screen.getByLabelText("auth.email"), {
      target: { value: "uo123456@uniovi.es" },
    });
    fireEvent.change(screen.getByLabelText("auth.password"), {
      target: { value: "12345678" },
    });

    fireEvent.click(screen.getByRole("button", { name: "auth.submitLogin" }));

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith(ROUTES.home, {
        replace: true,
      });
    });
  });

  it("shows invalid credentials for unauthorized api errors", async () => {
    loginMock.mockRejectedValue(
      new ApiError({
        statusCode: 401,
        code: "auth.unauthorized",
        message: "No autorizado",
      }),
    );

    renderLoginPage();

    fireEvent.change(screen.getByLabelText("auth.email"), {
      target: { value: "uo123456@uniovi.es" },
    });
    fireEvent.change(screen.getByLabelText("auth.password"), {
      target: { value: "12345678" },
    });

    fireEvent.click(screen.getByRole("button", { name: "auth.submitLogin" }));

    await waitFor(() => {
      expect(
        screen.getByText("errors.codes.auth.invalid_credentials"),
      ).toBeInTheDocument();
    });
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("shows the translated generic error for non-unauthorized failures", async () => {
    loginMock.mockRejectedValue(new Error("boom"));

    renderLoginPage();

    fireEvent.change(screen.getByLabelText("auth.email"), {
      target: { value: "uo123456@uniovi.es" },
    });
    fireEvent.change(screen.getByLabelText("auth.password"), {
      target: { value: "12345678" },
    });

    fireEvent.click(screen.getByRole("button", { name: "auth.submitLogin" }));

    await waitFor(() => {
      expect(screen.getByText("translated-error")).toBeInTheDocument();
    });
  });
});
