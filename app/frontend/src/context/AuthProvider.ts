import {
  createElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AuthContext } from "./AuthContext";
import { authApi } from "../services/auth/auth-api";
import { ApiError } from "../services/http/api-client";
import type {
  AuthStatus,
  ChangePasswordInput,
  LoginInput,
  PublicUser,
  RegisterInput,
} from "../types/auth";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<PublicUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const applySession = useCallback(
    (nextAccessToken: string, nextUser: PublicUser) => {
      setAccessToken(nextAccessToken);
      setUser(nextUser);
      setStatus("authenticated");
    },
    [],
  );

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    setStatus("anonymous");
  }, []);

  const restoreSession = useCallback(async () => {
    try {
      const response = await authApi.refresh();
      applySession(response.accessToken, response.user);
      return response.accessToken;
    } catch (error) {
      if (error instanceof ApiError) {
        clearSession();
        return null;
      }

      clearSession();
      return null;
    }
  }, [applySession, clearSession]);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  const login = useCallback(
    async (payload: LoginInput) => {
      const response = await authApi.login(payload);
      applySession(response.accessToken, response.user);
    },
    [applySession],
  );

  const register = useCallback(async (payload: RegisterInput) => {
    await authApi.register(payload);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const changePassword = useCallback(
    async (payload: ChangePasswordInput) => {
      const token = accessToken ?? (await restoreSession());

      if (!token) {
        clearSession();
        throw new ApiError({
          statusCode: 401,
          code: "auth.unauthorized",
          message: "Authentication required",
        });
      }

      await authApi.changePassword(token, payload);
      await logout();
    },
    [accessToken, clearSession, logout, restoreSession],
  );

  const executeWithSession = useCallback(
    async <T>(operation: (token: string) => Promise<T>): Promise<T> => {
      const initialToken = accessToken ?? (await restoreSession());

      if (!initialToken) {
        throw new ApiError({
          statusCode: 401,
          code: "auth.unauthorized",
          message: "Authentication required",
        });
      }

      try {
        return await operation(initialToken);
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 401) {
          throw error;
        }

        const refreshedToken = await restoreSession();

        if (!refreshedToken) {
          clearSession();
          throw error;
        }

        return operation(refreshedToken);
      }
    },
    [accessToken, clearSession, restoreSession],
  );

  const value = useMemo(
    () => ({
      accessToken,
      user,
      status,
      isAuthenticated: status === "authenticated" && user !== null,
      isAdmin: user?.role === "ADMIN",
      login,
      register,
      logout,
      restoreSession,
      changePassword,
      executeWithSession,
    }),
    [
      accessToken,
      user,
      status,
      login,
      register,
      logout,
      restoreSession,
      changePassword,
      executeWithSession,
    ],
  );

  return createElement(AuthContext.Provider, { value }, children);
}
