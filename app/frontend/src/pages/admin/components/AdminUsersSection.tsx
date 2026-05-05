import {
  Button,
  Card,
  CardContent,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { AdminToolbar, type StatusFilter } from "./AdminToolbar";
import { AdminUserCards } from "./AdminUserCards";
import { AdminUsersTable } from "./AdminUsersTable";
import type { AdminUser } from "../../../types/auth";

type AdminUsersSectionProps = {
  currentUserId: number | null;
  isMobile: boolean;
  loading: boolean;
  search: string;
  statusFilter: StatusFilter;
  users: AdminUser[];
  onDelete: (user: AdminUser) => void;
  onEdit: (user: AdminUser) => void;
  onRefresh: () => void;
  onResetPassword: (user: AdminUser) => void;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: StatusFilter) => void;
  onToggleStatus: (user: AdminUser) => void;
};

export function AdminUsersSection({
  currentUserId,
  isMobile,
  loading,
  search,
  statusFilter,
  users,
  onDelete,
  onEdit,
  onRefresh,
  onResetPassword,
  onSearchChange,
  onStatusFilterChange,
  onToggleStatus,
}: AdminUsersSectionProps) {
  const { t } = useTranslation();

  return (
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
              totalVisible={users.length}
              onSearchChange={onSearchChange}
              onStatusFilterChange={onStatusFilterChange}
            />
            <Button variant="outlined" onClick={onRefresh} disabled={loading}>
              {t("common.refresh")}
            </Button>
          </Stack>

          {loading ? (
            <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
              <CircularProgress />
            </Stack>
          ) : users.length === 0 ? (
            <Typography color="text.secondary">{t("admin.empty")}</Typography>
          ) : isMobile ? (
            <AdminUserCards
              currentUserId={currentUserId}
              users={users}
              onEdit={onEdit}
              onResetPassword={onResetPassword}
              onToggleStatus={onToggleStatus}
              onDelete={onDelete}
            />
          ) : (
            <Paper variant="outlined" sx={{ overflow: "hidden" }}>
              <AdminUsersTable
                currentUserId={currentUserId}
                users={users}
                onEdit={onEdit}
                onResetPassword={onResetPassword}
                onToggleStatus={onToggleStatus}
                onDelete={onDelete}
              />
            </Paper>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
