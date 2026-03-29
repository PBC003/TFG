import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { Button, Card, CardContent, Stack, Typography } from "@mui/material";

type QuestionsHeaderCardProps = {
  title: string;
  subtitle: string;
  refreshLabel: string;
  createLabel: string;
  loading: boolean;
  submitting: boolean;
  onRefresh: () => void;
  onCreate: () => void;
};

export function QuestionsHeaderCard({
  title,
  subtitle,
  refreshLabel,
  createLabel,
  loading,
  submitting,
  onRefresh,
  onCreate,
}: QuestionsHeaderCardProps) {
  return (
    <Card>
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Stack
          spacing={2}
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "center" }}
        >
          <Stack spacing={1.25}>
            <Typography variant="h4" fontWeight={700}>
              {title}
            </Typography>
            <Typography color="text.secondary">{subtitle}</Typography>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
            <Button
              variant="outlined"
              startIcon={<RefreshRoundedIcon />}
              onClick={onRefresh}
              disabled={loading || submitting}
            >
              {refreshLabel}
            </Button>
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={onCreate}
              disabled={submitting}
            >
              {createLabel}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
