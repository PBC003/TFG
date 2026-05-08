import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import { MathText } from "../../../../components/math/MathText";
import type {
  QuizAnalyticsAnswerDistributionItem,
  QuizAnalyticsQuestionStatsItem,
} from "../../../../types/quiz";
import {
  formatNumber,
  formatPercentValue,
  formatRawScore,
} from "../../../../utils/number";
import { DonutChart } from "./DonutChart";

type QuizAnalyticsQuestionStatsCardProps = {
  title: string;
  stats: QuizAnalyticsQuestionStatsItem[];
  language: string;
  labels: {
    question: string;
    attempts: string;
    correct: string;
    incorrect: string;
    unanswered: string;
    correctRate: string;
    averagePoints: string;
    answerDistribution: string;
    responses: string;
    otherAnswers: string;
    getTypeLabel: (type: string) => string;
    getAnswerLabel: (answer: QuizAnalyticsAnswerDistributionItem) => string;
  };
};

const SEGMENT_COLORS = [
  "#5b6ee1",
  "#e3008c",
  "#2aa0a4",
  "#8b6fc1",
  "#f59e0b",
  "#16a34a",
  "#64748b",
];

export function QuizAnalyticsQuestionStatsCard({
  title,
  stats,
  language,
  labels,
}: QuizAnalyticsQuestionStatsCardProps) {
  return (
    <Card>
      <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
        <Stack spacing={2.5}>
          <Typography variant="h6" fontWeight={800}>
            {title}
          </Typography>

          {stats.map((stat) => (
            <QuestionStatsPanel
              key={stat.questionId}
              stat={stat}
              language={language}
              labels={labels}
            />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

type QuestionStatsPanelProps = {
  stat: QuizAnalyticsQuestionStatsItem;
  language: string;
  labels: QuizAnalyticsQuestionStatsCardProps["labels"];
};

function QuestionStatsPanel({
  stat,
  language,
  labels,
}: QuestionStatsPanelProps) {
  const questionNumber = stat.order + 1;

  return (
    <Box
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
        bgcolor: "background.paper",
        overflow: "hidden",
      }}
    >
      <Stack spacing={0}>
        <Box
          sx={{
            px: { xs: 2.5, md: 3 },
            py: { xs: 2, md: 2.25 },
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: "action.hover",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            justifyContent="space-between"
            alignItems={{ sm: "center" }}
          >
            <Stack spacing={0.5}>
              <Typography variant="h6" fontWeight={800}>
                {labels.question} {questionNumber}. {stat.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {labels.getTypeLabel(stat.type)}
              </Typography>
            </Stack>
            <Chip
              label={formatPercentValue(stat.correctRate, language)}
              color={stat.correctRate >= 50 ? "success" : "warning"}
              variant="outlined"
            />
          </Stack>
        </Box>

        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={3}
          sx={{ px: { xs: 2.5, md: 3 }, py: { xs: 2.5, md: 3 } }}
          alignItems={{ xs: "stretch", lg: "center" }}
        >
          <Stack
            spacing={2}
            justifyContent="center"
            sx={{ flex: "1 1 62%", minWidth: 0 }}
          >
            <Box
              sx={{
                color: "text.secondary",
                "& .katex": { fontSize: "1em" },
              }}
            >
              <MathText value={stat.statement} emptyText="-" />
            </Box>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <MetricChip
                label={labels.attempts}
                value={formatNumber(stat.attempts, language)}
              />
              <MetricChip
                label={labels.correct}
                value={formatNumber(stat.correctCount, language)}
              />
              <MetricChip
                label={labels.incorrect}
                value={formatNumber(stat.incorrectCount, language)}
              />
              <MetricChip
                label={labels.unanswered}
                value={formatNumber(stat.unansweredCount, language)}
              />
              <MetricChip
                label={labels.correctRate}
                value={formatPercentValue(stat.correctRate, language)}
              />
              <MetricChip
                label={labels.averagePoints}
                value={formatRawScore(
                  stat.averageEarnedPoints,
                  stat.maxPoints,
                  language,
                )}
              />
            </Stack>
          </Stack>

          <Box
            sx={{
              flex: "0 1 360px",
              minWidth: { lg: 300 },
              borderLeft: { lg: 1 },
              borderColor: "divider",
              pl: { lg: 3 },
              alignSelf: "stretch",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <AnswerDistributionChart
              answers={stat.answerDistribution}
              language={language}
              labels={labels}
            />
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
}

type MetricChipProps = {
  label: string;
  value: string;
};

function MetricChip({ label, value }: MetricChipProps) {
  return (
    <Chip
      variant="outlined"
      label={
        <Stack direction="row" spacing={0.75}>
          <Typography component="span" variant="caption" color="text.secondary">
            {label}
          </Typography>
          <Typography component="span" variant="caption" fontWeight={800}>
            {value}
          </Typography>
        </Stack>
      }
    />
  );
}

type AnswerDistributionChartProps = {
  answers: QuizAnalyticsAnswerDistributionItem[];
  language: string;
  labels: QuizAnalyticsQuestionStatsCardProps["labels"];
};

function AnswerDistributionChart({
  answers,
  language,
  labels,
}: AnswerDistributionChartProps) {
  const totalResponses = answers.reduce((total, answer) => total + answer.count, 0);
  const chartAnswers = buildVisibleAnswers(answers, labels.otherAnswers);

  return (
    <Stack spacing={1.5} alignItems="stretch">
      <Stack spacing={1.25} alignItems="center">
        <Typography variant="subtitle2" fontWeight={800}>
          {labels.answerDistribution}
        </Typography>
        <DonutChart
          ariaLabel={labels.answerDistribution}
          size={156}
          thickness={31}
          segments={chartAnswers.map((answer, index) => ({
            color: SEGMENT_COLORS[index % SEGMENT_COLORS.length],
            value: answer.count,
          }))}
        >
          <Box
            sx={{
              width: 94,
              height: 94,
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
                {formatNumber(totalResponses, language)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {labels.responses}
              </Typography>
            </Stack>
          </Box>
        </DonutChart>
      </Stack>

      <Stack spacing={0.65} sx={{ minWidth: 0 }}>
        {chartAnswers.map((answer, index) => {
          const percent =
            totalResponses > 0 ? (answer.count / totalResponses) * 100 : 0;

          return (
            <Stack
              key={answer.key}
              direction="row"
              spacing={1.25}
              alignItems="center"
              justifyContent="space-between"
              sx={{ minWidth: 0 }}
            >
              <Stack direction="row" spacing={1} alignItems="center" minWidth={0}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: SEGMENT_COLORS[index % SEGMENT_COLORS.length],
                    flex: "0 0 auto",
                  }}
                />
                <Typography noWrap>{labels.getAnswerLabel(answer)}</Typography>
              </Stack>
              <Stack
                direction="row"
                spacing={0.75}
                alignItems="center"
                flex="0 0 auto"
              >
                <Typography variant="body2" color="text.secondary">
                  {formatNumber(answer.count, language)}
                </Typography>
                <Typography variant="body2" fontWeight={800}>
                  {formatPercentValue(percent, language)}
                </Typography>
              </Stack>
            </Stack>
          );
        })}
      </Stack>
    </Stack>
  );
}

function buildVisibleAnswers(
  answers: QuizAnalyticsAnswerDistributionItem[],
  otherAnswersLabel: string,
): QuizAnalyticsAnswerDistributionItem[] {
  const answered = answers.filter((answer) => answer.count > 0);

  if (answered.length === 0) {
    return answers.slice(0, 1);
  }

  if (answered.length < 6) {
    return answered;
  }

  const sorted = [...answered].sort((left, right) => right.count - left.count);
  const topAnswers = sorted.slice(0, 5);
  const otherCount = sorted
    .slice(5)
    .reduce((total, answer) => total + answer.count, 0);

  return [
    ...topAnswers,
    {
      key: "__other__",
      label: otherAnswersLabel,
      count: otherCount,
      isCorrect: null,
    },
  ];
}
