import type { AdminUser } from "../../../types/auth";

export type FeedbackState = {
  severity: "success" | "error";
  message: string;
} | null;

export type ConfirmState =
  | { type: "toggleStatus"; user: AdminUser }
  | { type: "delete"; user: AdminUser }
  | null;
