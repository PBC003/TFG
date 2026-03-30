import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { AuthContextValue } from "../../../context/AuthContext";
import { adminApi } from "../../../services/admin/admin-api";
import type { AdminUser } from "../../../types/auth";
import { getErrorMessage } from "../../../utils/error-code";
import type { UserEditFormValue } from "../../../components/admin/dialogs/UserEditDialog";
import type { StatusFilter } from "../../../components/admin/AdminToolbar";
import type { ConfirmState, FeedbackState } from "../types/admin-page.types";

type UseAdminUsersPageOptions = {
  auth: Pick<AuthContextValue, "executeWithSession" | "user">;
};

export function useAdminUsersPage({ auth }: UseAdminUsersPageOptions) {
  const { t } = useTranslation();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [passwordUser, setPasswordUser] = useState<AdminUser | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);

  const currentUserId = auth.user?.id ?? null;

  const visibleUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !normalizedSearch ||
        `${user.firstName} ${user.lastName}`
          .toLowerCase()
          .includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch) ||
        user.uo.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && user.isActive) ||
        (statusFilter === "inactive" && !user.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, users]);

  const replaceUser = useCallback((nextUser: AdminUser) => {
    setUsers((current) =>
      current.map((user) => (user.id === nextUser.id ? nextUser : user)),
    );
  }, []);

  const loadUsers = useCallback(
    async (successKey?: string) => {
      setLoading(true);

      try {
        const response = await auth.executeWithSession((token) =>
          adminApi.listUsers(token),
        );
        setUsers(response.users);
        if (successKey) {
          setFeedback({ severity: "success", message: t(successKey) });
        }
      } catch (error) {
        setFeedback({ severity: "error", message: getErrorMessage(t, error) });
      } finally {
        setLoading(false);
      }
    },
    [auth, t],
  );

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const handleEditSubmit = useCallback(
    async (payload: UserEditFormValue) => {
      if (!editingUser) {
        return;
      }

      setSubmitting(true);

      try {
        let nextUser = editingUser;
        const updatePayload = {
          firstName: payload.firstName,
          lastName: payload.lastName,
          email: payload.email,
        };

        if (
          payload.firstName !== editingUser.firstName ||
          payload.lastName !== editingUser.lastName ||
          payload.email !== editingUser.email
        ) {
          const updateResponse = await auth.executeWithSession((token) =>
            adminApi.updateUser(token, editingUser.id, updatePayload),
          );
          nextUser = updateResponse.user;
        }

        if (payload.role !== nextUser.role) {
          const roleResponse = await auth.executeWithSession((token) =>
            adminApi.updateRole(token, editingUser.id, { role: payload.role }),
          );
          nextUser = roleResponse.user;
        }

        replaceUser(nextUser);
        setEditingUser(null);
        setFeedback({ severity: "success", message: t("admin.updateSuccess") });
      } catch (error) {
        setFeedback({ severity: "error", message: getErrorMessage(t, error) });
      } finally {
        setSubmitting(false);
      }
    },
    [auth, editingUser, replaceUser, t],
  );

  const handlePasswordSubmit = useCallback(
    async (newPassword: string) => {
      if (!passwordUser) {
        return;
      }

      setSubmitting(true);

      try {
        await auth.executeWithSession((token) =>
          adminApi.resetPassword(token, passwordUser.id, { newPassword }),
        );
        setPasswordUser(null);
        setFeedback({
          severity: "success",
          message: t("admin.passwordSuccess"),
        });
      } catch (error) {
        setFeedback({ severity: "error", message: getErrorMessage(t, error) });
      } finally {
        setSubmitting(false);
      }
    },
    [auth, passwordUser, t],
  );

  const handleConfirmAction = useCallback(async () => {
    if (!confirmState) {
      return;
    }

    if (confirmState.user.id === currentUserId) {
      setFeedback({
        severity: "error",
        message: t("admin.dialogs.selfProtected"),
      });
      setConfirmState(null);
      return;
    }

    setSubmitting(true);

    try {
      if (confirmState.type === "toggleStatus") {
        const response = await auth.executeWithSession((token) =>
          adminApi.updateStatus(token, confirmState.user.id, {
            isActive: !confirmState.user.isActive,
          }),
        );
        replaceUser(response.user);
        setFeedback({ severity: "success", message: t("admin.statusSuccess") });
      } else {
        await auth.executeWithSession((token) =>
          adminApi.deleteUser(token, confirmState.user.id),
        );
        setUsers((current) =>
          current.filter((user) => user.id !== confirmState.user.id),
        );
        setFeedback({ severity: "success", message: t("admin.deleteSuccess") });
      }

      setConfirmState(null);
    } catch (error) {
      setFeedback({ severity: "error", message: getErrorMessage(t, error) });
    } finally {
      setSubmitting(false);
    }
  }, [auth, confirmState, currentUserId, replaceUser, t]);

  return {
    confirmState,
    currentUserId,
    editingUser,
    feedback,
    handleConfirmAction,
    handleEditSubmit,
    handlePasswordSubmit,
    loadUsers,
    loading,
    passwordUser,
    search,
    setConfirmState,
    setEditingUser,
    setFeedback,
    setPasswordUser,
    setSearch,
    setStatusFilter,
    statusFilter,
    submitting,
    visibleUsers,
  };
}
