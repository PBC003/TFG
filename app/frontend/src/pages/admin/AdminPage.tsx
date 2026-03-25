import {
  Alert,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import {
  AdminToolbar,
  type StatusFilter,
} from "../../components/admin/AdminToolbar";
import { AdminUserCards } from "../../components/admin/AdminUserCards";
import { AdminUsersTable } from "../../components/admin/AdminUsersTable";
import {
  UserEditDialog,
  type UserEditFormValue,
} from "../../components/admin/dialogs/UserEditDialog";
import { UserPasswordDialog } from "../../components/admin/dialogs/UserPasswordDialog";
import { UserConfirmDialog } from "../../components/admin/dialogs/UserConfirmDialog";
import { useAuth } from "../../hooks/useAuth";
import { adminApi } from "../../services/admin/admin-api";
import type { AdminUser } from "../../types/auth";
import { getErrorMessage } from "../../utils/error-code";

type FeedbackState = {
  severity: "success" | "error";
  message: string;
} | null;

type ConfirmState =
  | { type: "toggleStatus"; user: AdminUser }
  | { type: "delete"; user: AdminUser }
  | null;

export default function AdminPage() {
  const { t } = useTranslation();
  const auth = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
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

  const replaceUser = (nextUser: AdminUser) => {
    setUsers((current) =>
      current.map((user) => (user.id === nextUser.id ? nextUser : user)),
    );
  };

  const handleEditSubmit = async (payload: UserEditFormValue) => {
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
  };

  const handlePasswordSubmit = async (newPassword: string) => {
    if (!passwordUser) {
      return;
    }

    setSubmitting(true);

    try {
      await auth.executeWithSession((token) =>
        adminApi.resetPassword(token, passwordUser.id, { newPassword }),
      );
      setPasswordUser(null);
      setFeedback({ severity: "success", message: t("admin.passwordSuccess") });
    } catch (error) {
      setFeedback({ severity: "error", message: getErrorMessage(t, error) });
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmAction = async () => {
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
  };

  const confirmTitle = confirmState
    ? confirmState.type === "delete"
      ? t("admin.dialogs.deleteTitle")
      : confirmState.user.isActive
        ? t("admin.dialogs.deactivateTitle")
        : t("admin.dialogs.activateTitle")
    : "";

  const confirmDescription = confirmState
    ? confirmState.type === "delete"
      ? t("admin.dialogs.deleteDescription")
      : confirmState.user.isActive
        ? t("admin.dialogs.deactivateDescription")
        : t("admin.dialogs.activateDescription")
    : "";

  const confirmLabel = confirmState
    ? confirmState.type === "delete"
      ? t("common.delete")
      : confirmState.user.isActive
        ? t("common.deactivate")
        : t("common.activate")
    : "";

  return (
    <Stack spacing={3}>
      <Card>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack spacing={1.5}>
            <Typography variant="h4" fontWeight={700}>
              {t("admin.title")}
            </Typography>
            <Typography color="text.secondary">
              {t("admin.subtitle")}
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      {feedback ? (
        <Alert severity={feedback.severity} onClose={() => setFeedback(null)}>
          {feedback.message}
        </Alert>
      ) : null}

      <Card>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack spacing={2.5}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              spacing={2}
            >
              <AdminToolbar
                search={search}
                statusFilter={statusFilter}
                totalVisible={visibleUsers.length}
                onSearchChange={setSearch}
                onStatusFilterChange={setStatusFilter}
              />
              <Button
                variant="outlined"
                onClick={() => void loadUsers("admin.refreshSuccess")}
                disabled={loading}
              >
                {t("common.refresh")}
              </Button>
            </Stack>

            {loading ? (
              <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
                <CircularProgress />
              </Stack>
            ) : visibleUsers.length === 0 ? (
              <Typography color="text.secondary">{t("admin.empty")}</Typography>
            ) : isMobile ? (
              <AdminUserCards
                currentUserId={currentUserId}
                users={visibleUsers}
                onEdit={setEditingUser}
                onResetPassword={setPasswordUser}
                onToggleStatus={(user) =>
                  setConfirmState({ type: "toggleStatus", user })
                }
                onDelete={(user) => setConfirmState({ type: "delete", user })}
              />
            ) : (
              <Paper variant="outlined" sx={{ overflow: "hidden" }}>
                <AdminUsersTable
                  currentUserId={currentUserId}
                  users={visibleUsers}
                  onEdit={setEditingUser}
                  onResetPassword={setPasswordUser}
                  onToggleStatus={(user) =>
                    setConfirmState({ type: "toggleStatus", user })
                  }
                  onDelete={(user) => setConfirmState({ type: "delete", user })}
                />
              </Paper>
            )}
          </Stack>
        </CardContent>
      </Card>

      <UserEditDialog
        open={editingUser !== null}
        user={editingUser}
        submitting={submitting}
        onClose={() => setEditingUser(null)}
        onSubmit={handleEditSubmit}
      />
      <UserPasswordDialog
        open={passwordUser !== null}
        user={passwordUser}
        submitting={submitting}
        onClose={() => setPasswordUser(null)}
        onSubmit={handlePasswordSubmit}
      />
      <UserConfirmDialog
        open={confirmState !== null}
        title={confirmTitle}
        description={confirmDescription}
        confirmLabel={confirmLabel}
        confirmColor={
          confirmState?.type === "delete"
            ? "error"
            : confirmState?.user.isActive
              ? "warning"
              : "success"
        }
        submitting={submitting}
        onClose={() => setConfirmState(null)}
        onConfirm={handleConfirmAction}
      />
    </Stack>
  );
}
