import {
  Box,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import type { QuizAnalyticsItem } from "../../../../types/quiz";
import { formatNumber, formatPercentValue } from "../../../../utils/number";
import { DonutChart } from "./DonutChart";

type QuizAnalyticsDistributionCardProps = {
  title: string;
  labels: string[];
  outcomeLabels: {
    passed: string;
    failed: string;
    completed: string;
  };
  analytics: QuizAnalyticsItem;
  language: string;
};

const BUCKET_COLORS = ["#ef4444", "#f59e0b", "#2563eb", "#16a34a"];
const FAILED_COLOR = "#ef4444";
const PASSED_COLOR = "#16a34a";

export function QuizAnalyticsDistributionCard({
  title,
  labels,
  outcomeLabels,
  analytics,
  language,
}: QuizAnalyticsDistributionCardProps) {
  const buckets = analytics.scoreDistribution;
  const failedCount = buckets
    .filter((bucket) => bucket.maxScore < 5)
    .reduce((total, bucket) => total + bucket.count, 0);
  const passedCount = buckets
    .filter((bucket) => bucket.maxScore >= 5)
    .reduce((total, bucket) => total + bucket.count, 0);
  const completedCount = failedCount + passedCount;

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
      <Stack spacing={2.5}>
        <Typography variant="h6" fontWeight={800}>
          {title}
        </Typography>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={3}
          alignItems={{ xs: "stretch", md: "center" }}
        >
          <Stack spacing={2} alignItems="center" sx={{ minWidth: 240 }}>
            <DonutChart
              ariaLabel={`${outcomeLabels.passed}: ${formatNumber(
                passedCount,
                language,
              )}; ${outcomeLabels.failed}: ${formatNumber(
                failedCount,
                language,
              )}`}
              size={168}
              thickness={40}
              segments={[
                { color: PASSED_COLOR, value: passedCount },
                { color: FAILED_COLOR, value: failedCount },
              ]}
            >
              <Box
                sx={{
                  width: 104,
                  height: 104,
                  borderRadius: "50%",
                  bgcolor: "background.paper",
                  display: "grid",
                  placeItems: "center",
                  textAlign: "center",
                  px: 1,
                }}
              >
                <Stack spacing={0.25}>
                  <Typography variant="h5" fontWeight={900}>
                    {formatNumber(completedCount, language)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {outcomeLabels.completed}
                  </Typography>
                </Stack>
              </Box>
            </DonutChart>

            <Stack
              direction="row"
              spacing={1.5}
              flexWrap="wrap"
              justifyContent="center"
              useFlexGap
            >
              <LegendItem
                color={PASSED_COLOR}
                label={outcomeLabels.passed}
                value={passedCount}
                language={language}
              />
              <LegendItem
                color={FAILED_COLOR}
                label={outcomeLabels.failed}
                value={failedCount}
                language={language}
              />
            </Stack>
          </Stack>

          <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
            {buckets.map((bucket, index) => {
              const color = BUCKET_COLORS[index] ?? PASSED_COLOR;
              const value =
                completedCount > 0 ? (bucket.count / completedCount) * 100 : 0;

              return (
                <Stack key={bucket.label} spacing={0.75}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    spacing={1}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          bgcolor: color,
                        }}
                      />
                      <Typography fontWeight={700}>
                        {labels[index] ?? bucket.label}{" "}
                        <Typography
                          component="span"
                          color="text.secondary"
                          fontWeight={600}
                        >
                          {formatScoreBucketRange(bucket, language)}
                        </Typography>
                      </Typography>
                    </Stack>
                    <Typography color="text.secondary">
                      {formatNumber(bucket.count, language)} ·{" "}
                      {formatPercentValue(value, language)}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={value}
                    sx={{
                      height: 12,
                      borderRadius: 999,
                      bgcolor: "action.hover",
                      "& .MuiLinearProgress-bar": {
                        bgcolor: color,
                        borderRadius: 999,
                      },
                    }}
                  />
                </Stack>
              );
            })}
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
}

function formatScoreBucketRange(
  bucket: QuizAnalyticsItem["scoreDistribution"][number],
  language: string,
) {
  const minScore = formatNumber(bucket.minScore, language);
  const maxScore =
    bucket.maxScore >= 10
      ? formatNumber(10, language)
      : formatNumber(Math.ceil(bucket.maxScore), language);
  const closingBracket = bucket.maxScore >= 10 ? "]" : ")";

  return `[${minScore}, ${maxScore}${closingBracket}`;
}

type LegendItemProps = {
  color: string;
  label: string;
  value: number;
  language: string;
};

function LegendItem({ color, label, value, language }: LegendItemProps) {
  return (
    <Stack direction="row" spacing={0.75} alignItems="center">
      <Box
        sx={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          bgcolor: color,
        }}
      />
      <Typography variant="body2">
        {label}: {formatNumber(value, language)}
      </Typography>
    </Stack>
  );
}
