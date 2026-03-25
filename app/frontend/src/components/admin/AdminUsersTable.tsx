import {
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { formatDateTime } from "../../utils/date.ts";
import type { AdminUser } from "../../types/auth.ts";
import { RoleChip } from "../common/RoleChip";
import { StatusChip } from "../common/StatusChip";

interface AdminUsersTableProps {
  currentUserId: number | null;
  users: AdminUser[];
  onEdit: (user: AdminUser) => void;
  onResetPassword: (user: AdminUser) => void;
  onToggleStatus: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
}

export function AdminUsersTable({
  currentUserId,
  users,
  onEdit,
  onResetPassword,
  onToggleStatus,
  onDelete,
}: AdminUsersTableProps) {
  const { t, i18n } = useTranslation();

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>{t("admin.table.user")}</TableCell>
          <TableCell>{t("admin.table.email")}</TableCell>
          <TableCell>{t("admin.table.uo")}</TableCell>
          <TableCell>{t("admin.table.role")}</TableCell>
          <TableCell>{t("admin.table.status")}</TableCell>
          <TableCell>{t("admin.table.lastLogin")}</TableCell>
          <TableCell align="right">{t("common.actions")}</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {users.map((user) => {
          const isSelf = currentUserId === user.id;

          return (
            <TableRow key={user.id} hover>
              <TableCell>
                <Stack spacing={0.25}>
                  <Typography fontWeight={600}>
                    {user.firstName} {user.lastName}
                  </Typography>
                  {isSelf ? (
                    <Typography variant="caption" color="text.secondary">
                      ({t("profile.title")})
                    </Typography>
                  ) : null}
                </Stack>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.uo}</TableCell>
              <TableCell>
                <RoleChip role={user.role} />
              </TableCell>
              <TableCell>
                <StatusChip isActive={user.isActive} />
              </TableCell>
              <TableCell>
                {formatDateTime(
                  user.lastLoginAt,
                  i18n.resolvedLanguage ?? "es",
                )}
              </TableCell>
              <TableCell align="right">
                <Stack
                  direction="row"
                  justifyContent="flex-end"
                  spacing={1}
                  flexWrap="wrap"
                >
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
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
