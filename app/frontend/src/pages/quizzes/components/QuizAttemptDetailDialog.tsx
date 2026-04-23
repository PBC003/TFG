import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { MathText } from "../../../components/math/MathText";
import type {
  QuizAttemptReviewDetail,
  QuizSubmissionQuestionReview,
} from "../../../types/quiz";
import { formatDateTime } from "../../../utils/date";
import { formatQuizReviewAnswerValue } from "../../quiz-access/utils/quiz-access.utils";

type QuizAttemptDetailDialogProps = {
  detail: QuizAttemptReviewDetail | null;
  language: string;
  onClose: () => void;
};

function isReviewAnswered(review: QuizSubmissionQuestionReview): boolean {
  if (review.type === "multiple_choice") {
    return (
      Array.isArray(review.submittedValue) && review.submittedValue.length > 0
    );
  }

  if (review.type === "true_false") {
    return typeof review.submittedValue === "boolean";
  }

  return (
    typeof review.submittedValue === "string" &&
    review.submittedValue.trim().length > 0
  );
}

function renderAnswerValue(
  review: QuizSubmissionQuestionReview,
  value: unknown,
  t: TFunction,
) {
  const formattedValue = formatQuizReviewAnswerValue(review, value, t);

  if (review.type === "parametric" && typeof value === "string") {
    return (
      <MathText
        value={formattedValue}
        emptyText={t("quizAccess.notAnswered")}
      />
    );
  }

  return <Typography component="span">{formattedValue}</Typography>;
}

export function QuizAttemptDetailDialog({
  detail,
  language,
  onClose,
}: QuizAttemptDetailDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={detail !== null} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{t("quizAnalytics.detailTitle")}</DialogTitle>
      <DialogContent dividers>
        {detail ? (
          <Stack spacing={2.5}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
              <Stack spacing={1.5}>
                <Typography variant="h6" fontWeight={800}>
                  {detail.title}
                </Typography>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={1}
                  flexWrap="wrap"
                  useFlexGap
                >
                  <Chip
                    label={t("quizAnalytics.participantValue", {
                      value: detail.participantDisplayName,
                    })}
                  />
                  <Chip
                    label={t("quizAnalytics.attemptValue", {
                      current: detail.attemptNumber,
                    })}
                  />
                  <Chip
                    color={
                      detail.status === "submitted"
                        ? "success"
                        : detail.status === "expired"
                          ? "warning"
                          : "default"
                    }
                    label={t(`quizAnalytics.status.${detail.status}`)}
                  />
                </Stack>
                <Typography color="text.secondary">
                  {t("quizAnalytics.startedAtValue", {
                    value: formatDateTime(detail.startedAt, language),
                  })}
                </Typography>
                <Typography color="text.secondary">
                  {t("quizAnalytics.submittedAtValue", {
                    value: formatDateTime(detail.submittedAt, language),
                  })}
                </Typography>
                <Typography fontWeight={700}>
                  {t("quizAnalytics.rawScoreValue", {
                    earned: detail.earnedPoints,
                    max: detail.maxPoints,
                  })}
                </Typography>
              </Stack>
            </Paper>

            <Stack spacing={2}>
              {detail.review.map((review, index) => {
                const answered = isReviewAnswered(review);
                const resultColor = !answered
                  ? "warning"
                  : review.isCorrect
                    ? "success"
                    : "error";
                const resultLabel = !answered
                  ? t("quizAccess.notAnswered")
                  : review.isCorrect
                    ? t("quizAccess.correctLabel")
                    : t("quizAccess.incorrectLabel");

                return (
                  <Paper
                    key={`${review.questionId}-${index}`}
                    variant="outlined"
                    sx={{ p: 2.5, borderRadius: 3 }}
                  >
                    <Stack spacing={1.5}>
                      <Stack
                        direction={{ xs: "column", md: "row" }}
                        justifyContent="space-between"
                        spacing={1}
                      >
                        <Typography variant="h6" fontWeight={700}>
                          {t("quizAnalytics.questionTitle", {
                            index: index + 1,
                          })}
                        </Typography>
                        <Chip color={resultColor} label={resultLabel} />
                      </Stack>
                      <MathText value={review.statement} emptyText="—" />
                      <Divider />
                      <Stack spacing={1}>
                        <Typography component="div">
                          {t("quizAnalytics.submittedAnswerLabel")}
                        </Typography>
                        {renderAnswerValue(review, review.submittedValue, t)}
                      </Stack>
                      <Stack spacing={1}>
                        <Typography component="div">
                          {t("quizAnalytics.correctAnswerLabel")}
                        </Typography>
                        {renderAnswerValue(review, review.correctValue, t)}
                      </Stack>
                      <Typography>
                        {t("quizAnalytics.pointsPerQuestionValue", {
                          earned: review.earnedPoints,
                          max: review.points,
                        })}
                      </Typography>
                      {review.feedback ? (
                        <Typography color="text.secondary">
                          {review.feedback}
                        </Typography>
                      ) : null}
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
          </Stack>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("common.close")}</Button>
      </DialogActions>
    </Dialog>
  );
}
