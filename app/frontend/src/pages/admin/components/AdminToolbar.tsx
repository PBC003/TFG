import { MenuItem, Stack, TextField, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

export type StatusFilter = "all" | "active" | "inactive";

interface AdminToolbarProps {
  search: string;
  statusFilter: StatusFilter;
  totalVisible: number;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: StatusFilter) => void;
}

export function AdminToolbar({
  search,
  statusFilter,
  totalVisible,
  onSearchChange,
  onStatusFilterChange,
}: AdminToolbarProps) {
  const { t } = useTranslation();

  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={2}
      alignItems={{ md: "center" }}
    >
      <TextField
        fullWidth
        label={t("common.search")}
        placeholder={t("admin.searchPlaceholder")}
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />

      <TextField
        select
        label={t("admin.stateFilter")}
        value={statusFilter}
        onChange={(event) =>
          onStatusFilterChange(event.target.value as StatusFilter)
        }
        sx={{ minWidth: { xs: "100%", md: 220 } }}
      >
        <MenuItem value="all">{t("common.all")}</MenuItem>
        <MenuItem value="active">{t("common.active")}</MenuItem>
        <MenuItem value="inactive">{t("common.inactive")}</MenuItem>
      </TextField>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ minWidth: { md: 140 }, textAlign: { md: "right" } }}
      >
        {t("admin.totalUsers")}: {totalVisible}
      </Typography>
    </Stack>
  );
}
