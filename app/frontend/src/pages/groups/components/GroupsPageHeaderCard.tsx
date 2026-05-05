import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { Button, Card, CardContent, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

type GroupsPageHeaderCardProps = {
  onCreate: () => void;
  onRefresh: () => void;
  loading: boolean;
  submitting: boolean;
  importingMembers: boolean;
};

export function GroupsPageHeaderCard({
  onCreate,
  onRefresh,
  loading,
  submitting,
  importingMembers,
}: GroupsPageHeaderCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          spacing={2}
        >
          <Stack spacing={1}>
            <Typography variant="h4" fontWeight={700}>
              {t("groups.title")}
            </Typography>
            <Typography color="text.secondary">
              {t("groups.subtitle")}
            </Typography>
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
            <Button
              variant="outlined"
              startIcon={<RefreshRoundedIcon />}
              onClick={onRefresh}
              disabled={loading || submitting}
            >
              {t("common.refresh")}
            </Button>
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={onCreate}
              disabled={submitting || importingMembers}
            >
              {t("groups.createAction")}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
