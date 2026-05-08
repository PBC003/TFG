import {
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import type { PublicQuizCatalogItem } from "../../../types/quiz";
import { formatDateTime } from "../../../utils/date";
import { formatNumber } from "../../../utils/number";

type QuizCatalogCardProps = {
  quiz: PublicQuizCatalogItem;
  language: string;
  isSelected: boolean;
  onOpen: (quizId: string) => void;
};

export function QuizCatalogCard({
  quiz,
  language,
  isSelected,
  onOpen,
}: QuizCatalogCardProps) {
  const { t } = useTranslation();
  const attemptsRemainingLabel =
    quiz.attemptsRemaining === null
      ? t("quizAccess.catalog.attemptsUnknown", {
          count: quiz.attemptsAllowed,
        })
      : t("quizAccess.catalog.attemptsRemaining", {
          remaining: quiz.attemptsRemaining,
          max: quiz.attemptsAllowed,
        });

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        borderColor: isSelected ? "primary.main" : "divider",
      }}
    >
      <CardContent
        sx={{ p: { xs: 3, md: 4 }, "&:last-child": { pb: { xs: 3, md: 4 } } }}
      >
        <Stack spacing={2}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            spacing={1.5}
          >
            <Stack spacing={0.75}>
              <Typography variant="h6" fontWeight={800}>
                {quiz.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {quiz.description || t("quizAccess.catalog.noDescription")}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                label={
                  quiz.requiresAccessCode
                    ? t("quizAccess.catalog.requiresCode")
                    : t("quizAccess.catalog.openAccess")
                }
                color={quiz.requiresAccessCode ? "warning" : "success"}
              />
              <Chip
                label={
                  quiz.isAvailableNow
                    ? t("quizAccess.catalog.availableNow")
                    : t("quizAccess.catalog.notAvailableNow")
                }
                color={quiz.isAvailableNow ? "success" : "default"}
              />
            </Stack>
          </Stack>

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1}
            flexWrap="wrap"
            useFlexGap
          >
            <Chip
              label={t("quizAccess.catalog.teacher", {
                value: quiz.teacherName,
              })}
            />
            <Chip
              label={t("quizAccess.catalog.questionCount", {
                count: quiz.totalQuestions,
              })}
            />
            <Chip
              label={t("quizAccess.catalog.totalPoints", {
                count: quiz.totalPoints,
                value: formatNumber(quiz.totalPoints, language),
              })}
            />
            <Chip label={attemptsRemainingLabel} />
            <Chip
              label={
                quiz.timeLimitMinutes
                  ? t("quizAccess.catalog.timeLimit", {
                      value: quiz.timeLimitMinutes,
                    })
                  : t("quizAccess.catalog.noTimeLimit")
              }
            />
          </Stack>

          <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary">
              {t("quizAccess.catalog.startAt", {
                value: formatDateTime(quiz.startAt, language),
              })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("quizAccess.catalog.endAt", {
                value: formatDateTime(quiz.endAt, language),
              })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("quizAccess.catalog.remainingAttemptsText", {
                value: attemptsRemainingLabel,
              })}
            </Typography>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button variant="contained" onClick={() => onOpen(quiz.quizId)}>
              {t("quizAccess.catalog.startButton")}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
