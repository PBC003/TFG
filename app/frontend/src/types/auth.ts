export type Role = "ADMIN" | "TEACHER" | "STUDENT";

export interface PublicUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  uo: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser extends PublicUser {
  lastLoginAt: string | null;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface UpdateUserRoleInput {
  role: Role;
}

export interface UpdateUserStatusInput {
  isActive: boolean;
}

export interface UpdateUserPasswordInput {
  newPassword: string;
}

export type AuthStatus = "loading" | "authenticated" | "anonymous";
