import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { Button, Card, CardContent, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

type QuizzesPageHeaderCardProps = {
  loading: boolean;
  submitting: boolean;
  onRefresh: () => Promise<void>;
  onCreate: () => void;
};

export function QuizzesPageHeaderCard({
  loading,
  submitting,
  onRefresh,
  onCreate,
}: QuizzesPageHeaderCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "center" }}
          spacing={2}
        >
          <Stack spacing={1.25}>
            <Typography variant="h4" fontWeight={700}>
              {t("quizzes.title")}
            </Typography>
            <Typography color="text.secondary">
              {t("quizzes.subtitle")}
            </Typography>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
            <Button
              variant="outlined"
              startIcon={<RefreshRoundedIcon />}
              onClick={() => void onRefresh()}
              disabled={loading || submitting}
            >
              {t("common.refresh")}
            </Button>
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={onCreate}
              disabled={submitting}
            >
              {t("quizzes.createAction")}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
