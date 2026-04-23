import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import { Button, Paper, Stack, Typography } from "@mui/material";

type QuizAnalyticsHeaderCardProps = {
  title: string;
  description: string;
  exportDisabled: boolean;
  onBack: () => void;
  onExport: () => void;
  backLabel: string;
  exportLabel: string;
};

export function QuizAnalyticsHeaderCard({
  title,
  description,
  exportDisabled,
  onBack,
  onExport,
  backLabel,
  exportLabel,
}: QuizAnalyticsHeaderCardProps) {
  return (
    <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        spacing={2}
      >
        <Stack spacing={1}>
          <Typography variant="h4" fontWeight={800}>
            {title}
          </Typography>
          <Typography color="text.secondary">{description}</Typography>
        </Stack>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackRoundedIcon />}
            onClick={onBack}
          >
            {backLabel}
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadRoundedIcon />}
            onClick={onExport}
            disabled={exportDisabled}
          >
            {exportLabel}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
