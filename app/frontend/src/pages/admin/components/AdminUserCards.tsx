import {
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import type { AdminUser } from "../../../types/auth.ts";
import { formatDateTime } from "../../../utils/date.ts";
import { RoleChip } from "../../../components/common/RoleChip";
import { StatusChip } from "../../../components/common/StatusChip";

interface AdminUserCardsProps {
  currentUserId: number | null;
  users: AdminUser[];
  onEdit: (user: AdminUser) => void;
  onResetPassword: (user: AdminUser) => void;
  onToggleStatus: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
}

export function AdminUserCards({
  currentUserId,
  users,
  onEdit,
  onResetPassword,
  onToggleStatus,
  onDelete,
}: AdminUserCardsProps) {
  const { t, i18n } = useTranslation();

  return (
    <Stack spacing={2}>
      {users.map((user) => {
        const isSelf = currentUserId === user.id;

        return (
          <Card key={user.id}>
            <CardContent>
              <Stack spacing={2}>
                <Stack spacing={0.5}>
                  <Typography variant="h6">
                    {user.firstName} {user.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.uo}
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <RoleChip role={user.role} />
                  <StatusChip isActive={user.isActive} />
                </Stack>

                <Divider />

                <Typography variant="body2" color="text.secondary">
                  {t("admin.table.lastLogin")}:{" "}
                  {formatDateTime(
                    user.lastLoginAt,
                    i18n.resolvedLanguage ?? "es",
                  )}
                </Typography>

                {isSelf ? (
                  <Typography variant="caption" color="warning.main">
                    {t("admin.dialogs.selfProtected")}
                  </Typography>
                ) : null}

                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Button size="small" onClick={() => onEdit(user)}>
                    {t("common.edit")}
                  </Button>
                  <Button size="small" onClick={() => onResetPassword(user)}>
                    {t("common.resetPassword")}
                  </Button>
                  <Button
                    size="small"
                    color={user.isActive ? "warning" : "success"}
                    onClick={() => onToggleStatus(user)}
                    disabled={isSelf}
                  >
                    {user.isActive
                      ? t("common.deactivate")
                      : t("common.activate")}
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => onDelete(user)}
                    disabled={isSelf}
                  >
                    {t("common.delete")}
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
}
