import { LinearProgress, Paper, Stack, Typography } from "@mui/material";
import type { QuizAnalyticsItem } from "../../../../types/quiz";

type QuizAnalyticsDistributionCardProps = {
  title: string;
  labels: string[];
  analytics: QuizAnalyticsItem;
};

export function QuizAnalyticsDistributionCard({
  title,
  labels,
  analytics,
}: QuizAnalyticsDistributionCardProps) {
  const maxBucketCount = Math.max(
    ...(analytics.scoreDistribution.map((bucket) => bucket.count) ?? [0]),
  );

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
      <Stack spacing={2}>
        <Typography variant="h6" fontWeight={800}>
          {title}
        </Typography>
        {analytics.scoreDistribution.map((bucket, index) => (
          <Stack key={bucket.label} spacing={0.75}>
            <Stack direction="row" justifyContent="space-between" spacing={1}>
              <Typography fontWeight={700}>
                {labels[index] ?? bucket.label}
              </Typography>
              <Typography color="text.secondary">
                {bucket.label} · {bucket.count}
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={
                maxBucketCount > 0 ? (bucket.count / maxBucketCount) * 100 : 0
              }
              sx={{ height: 10, borderRadius: 999 }}
            />
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
}
