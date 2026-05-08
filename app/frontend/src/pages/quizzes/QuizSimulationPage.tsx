import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { Alert, Box, Button, Paper, Stack, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getErrorMessage } from "../../utils/error-code";
import { QuizActiveAttemptHeaderCard } from "../quiz-access/components/QuizActiveAttemptHeaderCard";
import { QuizAttemptSection } from "../quiz-access/components/QuizAttemptSection";
import { QuizResultSection } from "../quiz-access/components/QuizResultSection";
import { buildSubmitAnswersPayload } from "../quiz-access/utils/quiz-access-page.logic";
import { quizAccessApi } from "../../services/quizzes/quiz-access-api";
import { quizzesApi } from "../../services/quizzes/quizzes-api";
import type {
  QuizAnswerValue,
  QuizAttemptItem,
  QuizSubmissionResult,
} from "../../types/quiz";

export default function QuizSimulationPage() {
  const { t, i18n } = useTranslation();
  const { quizId = "" } = useParams();
  const auth = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    severity: "error" | "success" | "info";
    message: string;
  } | null>(null);
  const [attempt, setAttempt] = useState<QuizAttemptItem | null>(null);
  const [result, setResult] = useState<QuizSubmissionResult | null>(null);
  const [answers, setAnswers] = useState<Record<string, QuizAnswerValue>>({});
  const [nowMs, setNowMs] = useState(Date.now());

  const loadPreview = useCallback(async () => {
    if (!quizId) {
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const response = await auth.executeWithSession((token) =>
        quizzesApi.startPreview(token, quizId),
      );
      setAttempt(response.attempt);
      setResult(null);
      setAnswers({});
      setNowMs(Date.now());
    } catch (error) {
      setFeedback({ severity: "error", message: getErrorMessage(t, error) });
    } finally {
      setLoading(false);
    }
  }, [auth, quizId, t]);

  useEffect(() => {
    void loadPreview();
  }, [loadPreview]);

  useEffect(() => {
    if (!attempt?.expiresAt) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [attempt?.expiresAt]);

  const handleSubmit = useCallback(async () => {
    if (!attempt) {
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const response = await auth.executeWithSession((token) =>
        quizAccessApi.submitAttempt(token, attempt.attemptId, {
          answers: buildSubmitAnswersPayload(answers),
        }),
      );
      setResult(response.result);
      setAttempt(null);
      setFeedback({
        severity: "success",
        message: t("quizzes.simulation.submitSuccess"),
      });
    } catch (error) {
      setFeedback({ severity: "error", message: getErrorMessage(t, error) });
    } finally {
      setSubmitting(false);
    }
  }, [answers, attempt, auth, t]);

  const updateAnswer = useCallback(
    (questionId: string, value: QuizAnswerValue) => {
      setAnswers((current) => ({
        ...current,
        [questionId]: value,
      }));
    },
    [],
  );

  const pageTitle = useMemo(
    () => attempt?.title ?? result?.title ?? t("quizzes.simulation.title"),
    [attempt?.title, result?.title, t],
  );

  return (
    <Box sx={{ width: "100%", maxWidth: 1080, mx: "auto" }}>
      <Stack spacing={3}>
        <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            spacing={2}
          >
            <Stack spacing={1}>
              <Typography variant="h4" fontWeight={800}>
                {pageTitle}
              </Typography>
              <Typography color="text.secondary">
                {t("quizzes.simulation.subtitle")}
              </Typography>
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackRoundedIcon />}
                onClick={() => navigate("/quizzes")}
              >
                {t("quizzes.simulation.back")}
              </Button>
              <Button
                variant="contained"
                startIcon={<RefreshRoundedIcon />}
                disabled={loading || submitting}
                onClick={() => void loadPreview()}
              >
                {t("quizzes.simulation.restart")}
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {feedback ? (
          <Alert severity={feedback.severity} onClose={() => setFeedback(null)}>
            {feedback.message}
          </Alert>
        ) : null}

        {loading ? (
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Typography color="text.secondary">
              {t("common.loading")}
            </Typography>
          </Paper>
        ) : null}

        {attempt ? (
          <QuizActiveAttemptHeaderCard attempt={attempt} nowMs={nowMs} />
        ) : null}

        {attempt ? (
          <QuizAttemptSection
            attempt={attempt}
            answers={answers}
            submitting={submitting}
            language={i18n.language}
            onAnswerChange={updateAnswer}
            onSubmit={() => void handleSubmit()}
          />
        ) : null}

        {result ? (
          <QuizResultSection
            result={result}
            language={i18n.language}
            starting={loading}
            onNewLookup={() => navigate("/quizzes")}
            onStartAnotherAttempt={() => void loadPreview()}
          />
        ) : null}
      </Stack>
    </Box>
  );
}
