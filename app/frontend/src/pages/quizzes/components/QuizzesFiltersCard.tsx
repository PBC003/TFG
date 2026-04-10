import {
  Card,
  CardContent,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

type QuizzesFiltersCardProps = {
  search: string;
  statusFilter: "all" | "draft" | "published";
  visibleCount: number;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: "all" | "draft" | "published") => void;
};

export function QuizzesFiltersCard({
  search,
  statusFilter,
  visibleCount,
  onSearchChange,
  onStatusFilterChange,
}: QuizzesFiltersCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={2.5}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.5}
            alignItems={{ xs: "stretch", md: "center" }}
          >
            <TextField
              label={t("quizzes.searchPlaceholder")}
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              fullWidth
            />

            <TextField
              select
              label={t("quizzes.statusFilter")}
              value={statusFilter}
              onChange={(event) =>
                onStatusFilterChange(
                  event.target.value as "all" | "draft" | "published",
                )
              }
              sx={{ minWidth: { xs: "100%", md: 220 } }}
            >
              <MenuItem value="all">{t("common.all")}</MenuItem>
              <MenuItem value="draft">{t("quizzes.status.draft")}</MenuItem>
              <MenuItem value="published">
                {t("quizzes.status.published")}
              </MenuItem>
            </TextField>
          </Stack>

          <Typography color="text.secondary">
            {t("quizzes.totalVisible", { count: visibleCount })}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
