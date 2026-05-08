import { Alert, Button, Paper, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { QuizAnswerValue, QuizAttemptItem } from "../../../types/quiz";
import { getParametricAnswerValidationMessage } from "../utils/parametric-answer-validation.util";
import { QuizAttemptQuestionCard } from "./QuizAttemptQuestionCard";

type QuizAttemptSectionProps = {
  attempt: QuizAttemptItem;
  answers: Record<string, QuizAnswerValue>;
  submitting: boolean;
  language: string;
  onAnswerChange: (questionId: string, value: QuizAnswerValue) => void;
  onSubmit: () => void;
};

export function QuizAttemptSection({
  attempt,
  answers,
  submitting,
  language,
  onAnswerChange,
  onSubmit,
}: QuizAttemptSectionProps) {
  const { t } = useTranslation();

  const parametricValidationMessages = Object.fromEntries(
    attempt.questions.map((question) => {
      if (question.type !== "parametric") {
        return [question.questionId, null] as const;
      }

      const currentValue = answers[question.questionId];
      const stringValue = typeof currentValue === "string" ? currentValue : "";
      return [
        question.questionId,
        getParametricAnswerValidationMessage(stringValue),
      ] as const;
    }),
  );
  const hasInvalidParametricAnswers = Object.values(
    parametricValidationMessages,
  ).some((message) => Boolean(message));

  return (
    <Stack spacing={2.5}>
      {attempt.questions.map((question, index) => (
        <QuizAttemptQuestionCard
          key={question.questionId}
          question={question}
          index={index}
          value={answers[question.questionId] ?? null}
          disabled={submitting}
          language={language}
          onChange={(nextValue) =>
            onAnswerChange(question.questionId, nextValue)
          }
          parametricValidationMessage={
            parametricValidationMessages[question.questionId]
          }
        />
      ))}

      {hasInvalidParametricAnswers ? (
        <Alert severity="warning">
          {t("quizAccess.parametricAnswerValidation.summary")}
        </Alert>
      ) : null}

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
          <Button
            variant="contained"
            onClick={onSubmit}
            disabled={submitting || hasInvalidParametricAnswers}
          >
            {t("quizAccess.actions.submitAttempt")}
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
