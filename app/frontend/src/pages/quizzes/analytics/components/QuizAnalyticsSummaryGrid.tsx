import { Box, Paper, Stack, Typography } from "@mui/material";

type SummaryItem = {
  label: string;
  value: number;
};

export function QuizAnalyticsSummaryGrid({ items }: { items: SummaryItem[] }) {
  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, minmax(0, 1fr))",
          md: "repeat(3, minmax(0, 1fr))",
        },
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
    </Box>
  );
}
