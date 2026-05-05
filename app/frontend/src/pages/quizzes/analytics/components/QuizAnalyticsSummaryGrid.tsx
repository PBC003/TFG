import { Paper, Stack, Typography } from "@mui/material";

type SummaryItem = {
  label: string;
  value: number;
};

export function QuizAnalyticsSummaryGrid({ items }: { items: SummaryItem[] }) {
  return (
    <div
      style={{
        display: "grid",
        gap: "16px",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      }}
    >
      {items.map((item) => (
        <Paper
          key={item.label}
          variant="outlined"
          sx={{ p: 2.5, borderRadius: 3 }}
        >
          <Stack spacing={0.75}>
            <Typography variant="body2" color="text.secondary">
              {item.label}
            </Typography>
            <Typography variant="h5" fontWeight={800}>
              {item.value}
            </Typography>
          </Stack>
        </Paper>
      ))}
    </div>
  );
}
