import { Alert, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { QuizSubmissionResult } from "../../../types/quiz";
import { formatDateTime } from "../../../utils/date";
import { formatNumber } from "../../../utils/number";
import { QuizReviewCard } from "./QuizReviewCard";

type QuizResultSectionProps = {
  result: QuizSubmissionResult;
  language: string;
  starting: boolean;
  onNewLookup: () => void;
  onStartAnotherAttempt: () => void;
};

export function QuizResultSection({
  result,
  language,
  starting,
  onNewLookup,
  onStartAnotherAttempt,
}: QuizResultSectionProps) {
  const { t } = useTranslation();

  return (
    <Stack spacing={2.5}>
      <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
        <Stack spacing={1.25}>
          <Typography variant="h5" fontWeight={800}>
            {result.title}
          </Typography>
          <Typography color="text.secondary">
            {t("quizAccess.submittedAt", {
              value: formatDateTime(result.submittedAt, language),
            })}
          </Typography>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1}
            flexWrap="wrap"
            useFlexGap
          >
            <Chip
              label={t("quizAccess.scoreRaw", {
                earned: formatNumber(result.earnedPoints, language),
                max: formatNumber(result.maxPoints, language),
              })}
              color="primary"
            />
            <Chip
              label={t("quizAccess.scoreOverTen", {
                value: formatNumber(result.scoreOverTen, language),
              })}
              color="secondary"
            />
            <Chip
              label={t("quizAccess.remainingAttemptsTag", {
                count: result.attemptsRemaining,
              })}
            />
          </Stack>
        </Stack>
      </Paper>

      {!result.canRevealFeedback ? (
        <Alert severity="info">
          {result.revealBlockedByEndDate
            ? t("quizAccess.feedbackBlockedUntilEndDate")
            : t("quizAccess.feedbackBlockedUntilAttemptsEnd")}
        </Alert>
      ) : (
        <Stack spacing={2}>
          {result.review.map((review, index) => (
            <QuizReviewCard
              key={review.questionId}
              review={review}
              index={index}
              language={language}
            />
          ))}
        </Stack>
      )}

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
        <Button variant="outlined" onClick={onNewLookup}>
          {t("quizAccess.actions.newLookup")}
        </Button>
        {result.attemptsRemaining > 0 ? (
          <Button
            variant="contained"
            onClick={onStartAnotherAttempt}
            disabled={starting}
          >
            {t("quizAccess.actions.startAnotherAttempt")}
          </Button>
        ) : null}
      </Stack>
    </Stack>
  );
}
