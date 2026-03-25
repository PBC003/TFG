import { createContext } from "react";
import type {
  AuthStatus,
  ChangePasswordInput,
  LoginInput,
  PublicUser,
  RegisterInput,
} from "../types/auth.ts";

export interface AuthContextValue {
  accessToken: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  status: AuthStatus;
  user: PublicUser | null;
  login: (payload: LoginInput) => Promise<void>;
  register: (payload: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<string | null>;
  changePassword: (payload: ChangePasswordInput) => Promise<void>;
  executeWithSession: <T>(
    operation: (accessToken: string) => Promise<T>,
  ) => Promise<T>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
