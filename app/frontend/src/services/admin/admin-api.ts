import type {
  AdminUser,
  UpdateUserInput,
  UpdateUserPasswordInput,
  UpdateUserRoleInput,
  UpdateUserStatusInput,
} from "../../types/auth";
import { request } from "../http/api-client";

export const adminApi = {
  listUsers(accessToken: string) {
    return request<{ users: AdminUser[] }>("/users", {
      accessToken,
    });
  },
  updateUser(accessToken: string, userId: number, payload: UpdateUserInput) {
    return request<{ user: AdminUser }>(`/users/${userId}`, {
      method: "PATCH",
      accessToken,
      body: payload,
    });
  },
  updateRole(
    accessToken: string,
    userId: number,
    payload: UpdateUserRoleInput,
  ) {
    return request<{ user: AdminUser }>(`/users/${userId}/role`, {
      method: "PATCH",
      accessToken,
      body: payload,
    });
  },
  updateStatus(
    accessToken: string,
    userId: number,
    payload: UpdateUserStatusInput,
  ) {
    return request<{ user: AdminUser }>(`/users/${userId}/status`, {
      method: "PATCH",
      accessToken,
      body: payload,
    });
  },
  resetPassword(
    accessToken: string,
    userId: number,
    payload: UpdateUserPasswordInput,
  ) {
    return request<void>(`/users/${userId}/password`, {
      method: "PATCH",
      accessToken,
      body: payload,
    });
  },
  deleteUser(accessToken: string, userId: number) {
    return request<void>(`/users/${userId}`, {
      method: "DELETE",
      accessToken,
    });
  },
};
