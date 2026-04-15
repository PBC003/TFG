import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { MathText } from "../../../components/math/MathText";
import type { QuizSubmissionQuestionReview } from "../../../types/quiz";
import { formatQuizReviewAnswerValue } from "../utils/quiz-access.utils";

type QuizReviewCardProps = {
  review: QuizSubmissionQuestionReview;
  index: number;
};

export function QuizReviewCard({ review, index }: QuizReviewCardProps) {
  const { t } = useTranslation();

  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent
        sx={{ p: { xs: 3, md: 4 }, "&:last-child": { pb: { xs: 3, md: 4 } } }}
      >
        <Stack spacing={1.5}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            spacing={1}
          >
            <Stack spacing={0.5}>
              <Typography variant="h6" fontWeight={700}>
                {t("quizAccess.reviewTitle", { index: index + 1 })}
              </Typography>
              <Typography color="text.secondary">{review.title}</Typography>
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                color={review.isCorrect ? "success" : "error"}
                label={
                  review.isCorrect
                    ? t("quizAccess.correctLabel")
                    : t("quizAccess.incorrectLabel")
                }
              />
              <Chip
                label={t("quizAccess.pointsReviewValue", {
                  earned: review.earnedPoints,
                  max: review.points,
                })}
              />
            </Stack>
          </Stack>

          <MathText value={review.statement} emptyText="—" />

          <Divider />

          <Stack spacing={1}>
            <Typography variant="body2">
              <strong>{t("quizAccess.submittedAnswerLabel")}:</strong>{" "}
              <MathText
                value={formatQuizReviewAnswerValue(
                  review,
                  review.submittedValue,
                  t,
                )}
                emptyText="—"
              />
            </Typography>
            <Typography variant="body2">
              <strong>{t("quizAccess.correctAnswerLabel")}:</strong>{" "}
              <MathText
                value={formatQuizReviewAnswerValue(
                  review,
                  review.correctValue,
                  t,
                )}
                emptyText="—"
              />
            </Typography>
            {review.feedback ? (
              <Box>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <strong>{t("questions.fields.generalFeedback")}:</strong>
                </Typography>
                <MathText value={review.feedback} emptyText="—" />
              </Box>
            ) : null}
            {review.explanation ? (
              <Box>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <strong>{t("questions.fields.typeSpecificConfig")}:</strong>
                </Typography>
                <MathText value={review.explanation} emptyText="—" />
              </Box>
            ) : null}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
