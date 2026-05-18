import { Box, Paper, Stack, Typography } from "@mui/material";
import { formatNumber } from "../../../../utils/number";

type SummaryItem = {
  label: string;
  value: number | string;
};

export function QuizAnalyticsSummaryGrid({
  items,
  language,
}: {
  items: SummaryItem[];
  language: string;
}) {
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
          sx={{ p: 2.5, borderRadius: 2, textAlign: "center" }}
        >
          <Stack spacing={0.75} alignItems="center" justifyContent="center">
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
            >
              {item.label}
            </Typography>
            <Typography variant="h5" fontWeight={800} textAlign="center">
              {typeof item.value === "number"
                ? formatNumber(item.value, language)
                : item.value}
            </Typography>
          </Stack>
        </Paper>
      ))}
    </Box>
  );
}
