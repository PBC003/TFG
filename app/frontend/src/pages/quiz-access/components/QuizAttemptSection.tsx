import { Button, Paper, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { QuizAnswerValue, QuizAttemptItem } from "../../../types/quiz";
import { QuizAttemptQuestionCard } from "./QuizAttemptQuestionCard";

type QuizAttemptSectionProps = {
  attempt: QuizAttemptItem;
  answers: Record<string, QuizAnswerValue>;
  submitting: boolean;
  onAnswerChange: (questionId: string, value: QuizAnswerValue) => void;
  onSubmit: () => void;
};

export function QuizAttemptSection({
  attempt,
  answers,
  submitting,
  onAnswerChange,
  onSubmit,
}: QuizAttemptSectionProps) {
  const { t } = useTranslation();

  return (
    <Stack spacing={2.5}>
      {attempt.questions.map((question, index) => (
        <QuizAttemptQuestionCard
          key={question.questionId}
          question={question}
          index={index}
          value={answers[question.questionId] ?? null}
          disabled={submitting}
          onChange={(nextValue) =>
            onAnswerChange(question.questionId, nextValue)
          }
        />
      ))}

      <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          spacing={2}
          alignItems={{ md: "center" }}
        >
          <Typography color="text.secondary">
            {t("quizAccess.questionCountSummary", {
              count: attempt.questions.length,
            })}
          </Typography>
          <Button variant="contained" onClick={onSubmit} disabled={submitting}>
            {t("quizAccess.actions.submitAttempt")}
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
