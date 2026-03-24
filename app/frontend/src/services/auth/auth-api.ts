import type {
  ChangePasswordInput,
  LoginInput,
  PublicUser,
  RegisterInput,
} from "../../types/auth";
import { request } from "../http/api-client";

export interface AuthSuccessResponse {
  accessToken: string;
  user: PublicUser;
}

export const authApi = {
  login(payload: LoginInput) {
    return request<AuthSuccessResponse>("/auth/login", {
      method: "POST",
      body: payload,
    });
  },
  register(payload: RegisterInput) {
    return request<{ user: PublicUser }>("/auth/register", {
      method: "POST",
      body: payload,
    });
  },
  refresh() {
    return request<AuthSuccessResponse>("/auth/refresh", {
      method: "POST",
    });
  },
  logout() {
    return request<void>("/auth/logout", {
      method: "POST",
    });
  },
  me(accessToken: string) {
    return request<{ user: PublicUser }>("/auth/me", {
      accessToken,
    });
  },
  changePassword(accessToken: string, payload: ChangePasswordInput) {
    return request<void>("/auth/change-password", {
      method: "PATCH",
      accessToken,
      body: payload,
    });
  },
};
