import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import { Button, Paper, Stack, Typography } from "@mui/material";

type QuizAnalyticsHeaderCardProps = {
  title: string;
  description: string;
  onBack: () => void;
  onExportStats: () => void;
  backLabel: string;
  exportStatsLabel: string;
};

export function QuizAnalyticsHeaderCard({
  title,
  description,
  onBack,
  onExportStats,
  backLabel,
  exportStatsLabel,
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
        <Stack
          className="analytics-print-hidden"
          direction={{ xs: "column", sm: "row" }}
          spacing={1.25}
        >
          <Button
            variant="outlined"
            startIcon={<ArrowBackRoundedIcon />}
            onClick={onBack}
          >
            {backLabel}
          </Button>
          <Button
            variant="contained"
            startIcon={<PrintRoundedIcon />}
            onClick={onExportStats}
          >
            {exportStatsLabel}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
