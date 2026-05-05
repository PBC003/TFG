import { Alert, Stack, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { UserConfirmDialog } from "./components/dialogs/UserConfirmDialog";
import { UserEditDialog } from "./components/dialogs/UserEditDialog";
import { UserPasswordDialog } from "./components/dialogs/UserPasswordDialog";
import { useAuth } from "../../hooks/useAuth";
import { AdminPageHeader } from "./components/AdminPageHeader";
import { AdminUsersSection } from "./components/AdminUsersSection";
import { useAdminUsersPage } from "./hooks/useAdminUsersPage";
import type { ConfirmState } from "./types/admin-page.types";

function getConfirmDialogCopy(
  t: (key: string) => string,
  confirmState: ConfirmState,
) {
  if (!confirmState) {
    return {
      confirmColor: "success" as const,
      confirmDescription: "",
      confirmLabel: "",
      confirmTitle: "",
    };
  }

  if (confirmState.type === "delete") {
    return {
      confirmColor: "error" as const,
      confirmDescription: t("admin.dialogs.deleteDescription"),
      confirmLabel: t("common.delete"),
      confirmTitle: t("admin.dialogs.deleteTitle"),
    };
  }

  if (confirmState.user.isActive) {
    return {
      confirmColor: "warning" as const,
      confirmDescription: t("admin.dialogs.deactivateDescription"),
      confirmLabel: t("common.deactivate"),
      confirmTitle: t("admin.dialogs.deactivateTitle"),
    };
  }

  return {
    confirmColor: "success" as const,
    confirmDescription: t("admin.dialogs.activateDescription"),
    confirmLabel: t("common.activate"),
    confirmTitle: t("admin.dialogs.activateTitle"),
  };
}

export default function AdminPage() {
  const { t } = useTranslation();
  const auth = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const {
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
  } = useAdminUsersPage({ auth });

  const { confirmColor, confirmDescription, confirmLabel, confirmTitle } =
    getConfirmDialogCopy(t, confirmState);

  return (
    <Stack spacing={3}>
      <AdminPageHeader />

      {feedback ? (
        <Alert severity={feedback.severity} onClose={() => setFeedback(null)}>
          {feedback.message}
        </Alert>
      ) : null}

      <AdminUsersSection
        currentUserId={currentUserId}
        isMobile={isMobile}
        loading={loading}
        search={search}
        statusFilter={statusFilter}
        users={visibleUsers}
        onDelete={(user) => setConfirmState({ type: "delete", user })}
        onEdit={setEditingUser}
        onRefresh={() => void loadUsers("admin.refreshSuccess")}
        onResetPassword={setPasswordUser}
        onSearchChange={setSearch}
        onStatusFilterChange={setStatusFilter}
        onToggleStatus={(user) =>
          setConfirmState({ type: "toggleStatus", user })
        }
      />

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
        confirmColor={confirmColor}
        submitting={submitting}
        onClose={() => setConfirmState(null)}
        onConfirm={handleConfirmAction}
      />
    </Stack>
  );
}
