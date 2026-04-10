import {
  Button,
  Chip,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import type { PublicQuizCatalogItem } from "../../../types/quiz";
import { formatDateTime } from "../../../utils/date";

type SelectedQuizCardProps = {
  quiz: PublicQuizCatalogItem;
  accessCode: string;
  startDisabled: boolean;
  loading: boolean;
  reviewLoading: boolean;
  canRequestBestResult: boolean;
  language: string;
  onAccessCodeChange: (value: string) => void;
  onStart: () => void;
  onLoadBestResult: () => void;
  onResetLookup: () => void;
};

export function SelectedQuizCard({
  quiz,
  accessCode,
  startDisabled,
  loading,
  reviewLoading,
  canRequestBestResult,
  language,
  onAccessCodeChange,
  onStart,
  onLoadBestResult,
  onResetLookup,
}: SelectedQuizCardProps) {
  const { t } = useTranslation();

  return (
    <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
      <Stack spacing={2.5}>
        <Stack spacing={1}>
          <Typography variant="h4" fontWeight={800}>
            {quiz.title}
          </Typography>
          <Typography color="text.secondary">
            {quiz.description || t("quizAccess.catalog.noDescription")}
          </Typography>
        </Stack>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1}
          flexWrap="wrap"
          useFlexGap
        >
          <Chip
            label={t("quizAccess.catalog.teacher", { value: quiz.teacherName })}
          />
          <Chip
            label={t("quizAccess.catalog.questionCount", {
              count: quiz.totalQuestions,
            })}
          />
          <Chip
            label={t("quizAccess.catalog.totalPoints", {
              count: quiz.totalPoints,
            })}
          />
          <Chip
            label={t("quizAccess.catalog.attemptsRemaining", {
              remaining: quiz.attemptsRemaining ?? quiz.attemptsAllowed,
              max: quiz.attemptsAllowed,
            })}
          />
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
              value: t("quizAccess.catalog.attemptsRemaining", {
                remaining: quiz.attemptsRemaining ?? quiz.attemptsAllowed,
                max: quiz.attemptsAllowed,
              }),
            })}
          </Typography>
        </Stack>

        {quiz.requiresAccessCode ? (
          <TextField
            label={t("quizAccess.fields.accessCode")}
            value={accessCode}
            onChange={(event) =>
              onAccessCodeChange(event.target.value.toUpperCase())
            }
            fullWidth
          />
        ) : null}

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <Button
            variant="contained"
            onClick={onStart}
            disabled={startDisabled || loading}
          >
            {t("quizAccess.actions.startSelectedQuiz")}
          </Button>
          {canRequestBestResult ? (
            <Button
              variant="outlined"
              onClick={onLoadBestResult}
              disabled={reviewLoading}
            >
              {t("quizAccess.actions.viewBestResult")}
            </Button>
          ) : null}
          <Button variant="outlined" onClick={onResetLookup}>
            {t("quizAccess.actions.newLookup")}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
