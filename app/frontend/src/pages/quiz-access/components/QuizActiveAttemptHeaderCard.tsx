import { Chip, Paper, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { QuizAttemptItem } from "../../../types/quiz";
import { formatRemainingTime } from "../utils/quiz-access.utils";

type QuizActiveAttemptHeaderCardProps = {
  attempt: QuizAttemptItem;
  nowMs: number;
};

export function QuizActiveAttemptHeaderCard({
  attempt,
  nowMs,
}: QuizActiveAttemptHeaderCardProps) {
  const { t } = useTranslation();

  return (
    <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
      <Stack spacing={1.25}>
        <Typography variant="h4" fontWeight={800}>
          {attempt.title}
        </Typography>
        {attempt.description ? (
          <Typography color="text.secondary">{attempt.description}</Typography>
        ) : null}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1}
          flexWrap="wrap"
          useFlexGap
        >
          <Chip
            label={t("quizAccess.attemptTag", {
              current: attempt.attemptNumber,
              max: attempt.attemptsAllowed,
            })}
          />
          <Chip
            label={t("quizAccess.remainingAttemptsTag", {
              count: attempt.attemptsRemaining,
            })}
          />
          <Chip
            color={attempt.expiresAt ? "warning" : "default"}
            label={formatRemainingTime(attempt.expiresAt, nowMs, t)}
          />
        </Stack>
      </Stack>
    </Paper>
  );
}
