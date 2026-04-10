import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  FormLabel,
  InputAdornment,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  TablePagination,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { MathText } from "../../components/math/MathText";
import { quizAccessApi } from "../../services/quizzes/quiz-access-api";
import type {
  PublicAttemptQuestion,
  PublicChoiceOption,
  PublicQuizCatalogItem,
  QuizAnswerValue,
  QuizAttemptItem,
  QuizSubmissionQuestionReview,
  QuizSubmissionResult,
} from "../../types/quiz";
import { formatDateTime } from "../../utils/date";
import { getErrorMessage } from "../../utils/error-code";

const QUIZ_ROWS_PER_PAGE_OPTIONS = [5, 10, 20];

function formatRemainingTime(
  expiresAt: string | null,
  nowMs: number,
  t: (key: string, options?: Record<string, unknown>) => string,
) {
  if (!expiresAt) {
    return t("quizAccess.noTimeLimit");
  }

  const remainingMs = Math.max(0, new Date(expiresAt).getTime() - nowMs);
  const totalSeconds = Math.floor(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return t("quizAccess.timerValue", {
    minutes,
    seconds: `${seconds}`.padStart(2, "0"),
  });
}

function getOptionLabel(
  options: PublicChoiceOption[] | null,
  optionKey: string,
): string {
  return options?.find((option) => option.key === optionKey)?.text ?? optionKey;
}

function formatAnswerValue(
  review: QuizSubmissionQuestionReview,
  value: unknown,
  t: (key: string) => string,
): string {
  if (review.type === "true_false") {
    if (value === true) {
      return t("questions.answers.true");
    }

    if (value === false) {
      return t("questions.answers.false");
    }

    return t("quizAccess.notAnswered");
  }

  if (review.type === "single_choice") {
    if (typeof value !== "string") {
      return t("quizAccess.notAnswered");
    }

    return getOptionLabel(review.availableOptions, value);
  }

  if (review.type === "multiple_choice") {
    if (!Array.isArray(value) || value.length === 0) {
      return t("quizAccess.notAnswered");
    }

    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => getOptionLabel(review.availableOptions, item))
      .join(", ");
  }

  return t("quizAccess.notAnswered");
}

function renderQuestionInput(
  question: PublicAttemptQuestion,
  value: QuizAnswerValue,
  onChange: (nextValue: QuizAnswerValue) => void,
  disabled: boolean,
  t: (key: string) => string,
) {
  if (question.type === "true_false") {
    return (
      <RadioGroup
        value={typeof value === "boolean" ? String(value) : ""}
        onChange={(event) => onChange(event.target.value === "true")}
      >
        <FormControlLabel
          value="true"
          control={<Radio disabled={disabled} />}
          label={t("questions.answers.true")}
        />
        <FormControlLabel
          value="false"
          control={<Radio disabled={disabled} />}
          label={t("questions.answers.false")}
        />
      </RadioGroup>
    );
  }

  if (question.type === "single_choice") {
    const options =
      "options" in question.questionConfig
        ? question.questionConfig.options
        : [];

    return (
      <RadioGroup
        value={typeof value === "string" ? value : ""}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <FormControlLabel
            key={option.key}
            value={option.key}
            control={<Radio disabled={disabled} />}
            label={<MathText value={option.text} emptyText="—" />}
          />
        ))}
      </RadioGroup>
    );
  }

  const options =
    "options" in question.questionConfig ? question.questionConfig.options : [];
  const selectedValues = Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];

  return (
    <Stack spacing={1}>
      {options.map((option) => {
        const checked = selectedValues.includes(option.key);

        return (
          <FormControlLabel
            key={option.key}
            control={
              <Checkbox
                checked={checked}
                disabled={disabled}
                onChange={(event) => {
                  if (event.target.checked) {
                    onChange([...selectedValues, option.key]);
                    return;
                  }

                  onChange(
                    selectedValues.filter(
                      (candidate) => candidate !== option.key,
                    ),
                  );
                }}
              />
            }
            label={<MathText value={option.text} emptyText="—" />}
          />
        );
      })}
    </Stack>
  );
}

function normalizeForSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\\{}_^$]/g, " ")
    .toLowerCase();
}

export default function QuizAccessPage() {
  const { t, i18n } = useTranslation();
  const auth = useAuth();
  const navigate = useNavigate();
  const { quizId: routeQuizId } = useParams();
  const participantIdentity = auth.user ? `user:${auth.user.id}` : "";
  const [accessCode, setAccessCode] = useState("");
  const [catalogSearch, setCatalogSearch] = useState("");
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [feedback, setFeedback] = useState<{
    severity: "success" | "error" | "info";
    message: string;
  } | null>(null);
  const [activeAttempt, setActiveAttempt] = useState<QuizAttemptItem | null>(
    null,
  );
  const [answers, setAnswers] = useState<Record<string, QuizAnswerValue>>({});
  const [result, setResult] = useState<QuizSubmissionResult | null>(null);
  const [publicQuizzes, setPublicQuizzes] = useState<PublicQuizCatalogItem[]>(
    [],
  );
  const [catalogPage, setCatalogPage] = useState(0);
  const [catalogRowsPerPage, setCatalogRowsPerPage] = useState(5);
  const [nowMs, setNowMs] = useState(Date.now());
  const [autoSubmitTriggered, setAutoSubmitTriggered] = useState(false);

  const refreshCatalog = useCallback(async () => {
    setCatalogLoading(true);

    try {
      const response =
        await quizAccessApi.listPublishedQuizzes(participantIdentity);
      setPublicQuizzes(response.quizzes);
    } catch (error) {
      setFeedback({ severity: "error", message: getErrorMessage(t, error) });
    } finally {
      setCatalogLoading(false);
    }
  }, [participantIdentity, t]);

  useEffect(() => {
    if (!participantIdentity) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void refreshCatalog();
    }, 150);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [participantIdentity, refreshCatalog]);

  useEffect(() => {
    setActiveAttempt(null);
    setAnswers({});
    setResult(null);
    setFeedback(null);
    setAccessCode("");
    setAutoSubmitTriggered(false);
  }, [routeQuizId]);

  useEffect(() => {
    if (!activeAttempt?.expiresAt) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [activeAttempt?.expiresAt]);

  const selectedQuiz = useMemo(
    () =>
      routeQuizId
        ? (publicQuizzes.find((quiz) => quiz.quizId === routeQuizId) ?? null)
        : null,
    [publicQuizzes, routeQuizId],
  );

  const handleStartAttempt = useCallback(
    async (options?: { quizId?: string; accessCode?: string | null }) => {
      const normalizedQuizId = options?.quizId ?? routeQuizId ?? undefined;
      const normalizedAccessCode =
        options?.accessCode !== undefined
          ? (options.accessCode?.trim().toUpperCase() ?? "")
          : accessCode.trim().toUpperCase();

      if (!participantIdentity) {
        setFeedback({
          severity: "error",
          message: t("errors.codes.common.unauthorized"),
        });
        return;
      }

      if (!normalizedQuizId && !normalizedAccessCode) {
        setFeedback({
          severity: "info",
          message: t("quizAccess.accessLookupRequired"),
        });
        return;
      }

      setStarting(true);
      setFeedback(null);

      try {
        const response = await quizAccessApi.startAttempt({
          quizId: normalizedQuizId,
          accessCode: normalizedAccessCode || null,
          participantName: participantIdentity,
        });
        setActiveAttempt(response.attempt);
        setAnswers({});
        setResult(null);
        setAutoSubmitTriggered(false);
        setNowMs(Date.now());
        await refreshCatalog();
      } catch (error) {
        setFeedback({ severity: "error", message: getErrorMessage(t, error) });
      } finally {
        setStarting(false);
      }
    },
    [accessCode, participantIdentity, refreshCatalog, routeQuizId, t],
  );

  const handleSubmitAttempt = useCallback(async () => {
    if (!activeAttempt) {
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const response = await quizAccessApi.submitAttempt(
        activeAttempt.attemptId,
        {
          answers: Object.entries(answers).map(([questionId, value]) => ({
            questionId,
            value,
          })),
        },
      );
      setResult(response.result);
      setActiveAttempt(null);
      setAutoSubmitTriggered(false);
      setFeedback({
        severity: "success",
        message: t("quizAccess.submitSuccess"),
      });
      await refreshCatalog();
    } catch (error) {
      setFeedback({ severity: "error", message: getErrorMessage(t, error) });
    } finally {
      setSubmitting(false);
    }
  }, [activeAttempt, answers, refreshCatalog, t]);

  useEffect(() => {
    if (
      !activeAttempt?.expiresAt ||
      autoSubmitTriggered ||
      submitting ||
      result !== null
    ) {
      return;
    }

    if (new Date(activeAttempt.expiresAt).getTime() > nowMs) {
      return;
    }

    setAutoSubmitTriggered(true);
    void handleSubmitAttempt();
  }, [
    activeAttempt,
    autoSubmitTriggered,
    handleSubmitAttempt,
    nowMs,
    result,
    submitting,
  ]);

  const filteredCatalog = useMemo(() => {
    const normalizedSearch = normalizeForSearch(catalogSearch.trim());

    const sortedItems = [...publicQuizzes].sort((left, right) => {
      if (routeQuizId) {
        if (left.quizId === routeQuizId) {
          return -1;
        }

        if (right.quizId === routeQuizId) {
          return 1;
        }
      }

      return left.title.localeCompare(right.title, undefined, {
        sensitivity: "base",
      });
    });

    if (!normalizedSearch) {
      return sortedItems;
    }

    return sortedItems.filter((quiz) =>
      normalizeForSearch(
        [
          quiz.title,
          quiz.description ?? "",
          quiz.teacherName,
          quiz.quizId,
        ].join(" "),
      ).includes(normalizedSearch),
    );
  }, [catalogSearch, publicQuizzes, routeQuizId]);

  useEffect(() => {
    setCatalogPage(0);
  }, [catalogSearch, publicQuizzes, routeQuizId]);

  const paginatedCatalog = useMemo(() => {
    const startIndex = catalogPage * catalogRowsPerPage;
    return filteredCatalog.slice(startIndex, startIndex + catalogRowsPerPage);
  }, [catalogPage, catalogRowsPerPage, filteredCatalog]);

  const questionCount = activeAttempt?.questions.length ?? 0;

  const quizInfoCard = useMemo(() => {
    if (!activeAttempt) {
      return null;
    }

    return (
      <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
        <Stack spacing={1.25}>
          <Typography variant="h4" fontWeight={800}>
            {activeAttempt.title}
          </Typography>
          {activeAttempt.description ? (
            <Typography color="text.secondary">
              {activeAttempt.description}
            </Typography>
          ) : null}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1}
            flexWrap="wrap"
            useFlexGap
          >
            <Chip
              label={t("quizAccess.attemptTag", {
                current: activeAttempt.attemptNumber,
                max: activeAttempt.attemptsAllowed,
              })}
            />
            <Chip
              label={t("quizAccess.remainingAttemptsTag", {
                count: activeAttempt.attemptsRemaining,
              })}
            />
            <Chip
              color={activeAttempt.expiresAt ? "warning" : "default"}
              label={formatRemainingTime(
                activeAttempt.expiresAt,
                nowMs,
                (key, options) => t(key, options),
              )}
            />
          </Stack>
        </Stack>
      </Paper>
    );
  }, [activeAttempt, nowMs, t]);

  const selectedQuizStartDisabled =
    starting ||
    !participantIdentity ||
    !selectedQuiz ||
    !selectedQuiz.isAvailableNow ||
    selectedQuiz.attemptsRemaining === 0 ||
    (selectedQuiz.requiresAccessCode && !accessCode.trim());

  return (
    <Box sx={{ width: "100%", maxWidth: 1080, mx: "auto" }}>
      <Stack spacing={3}>
        {!activeAttempt && !routeQuizId ? (
          <Paper
            variant="outlined"
            sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}
          >
            <Stack spacing={1.25}>
              <Typography variant="h4" fontWeight={800}>
                {t("quizAccess.title")}
              </Typography>
              <Typography color="text.secondary">
                {t("quizAccess.subtitle")}
              </Typography>
            </Stack>
          </Paper>
        ) : null}

        {feedback ? (
          <Alert severity={feedback.severity} onClose={() => setFeedback(null)}>
            {feedback.message}
          </Alert>
        ) : null}

        {!activeAttempt && !result && routeQuizId ? (
          <Paper
            variant="outlined"
            sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}
          >
            {catalogLoading && !selectedQuiz ? (
              <Typography color="text.secondary">
                {t("common.loading")}
              </Typography>
            ) : !selectedQuiz ? (
              <Stack spacing={1.5}>
                <Typography variant="h5" fontWeight={800}>
                  {t("errors.codes.quiz.not_found")}
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/quiz-access")}
                >
                  {t("quizAccess.actions.newLookup")}
                </Button>
              </Stack>
            ) : (
              <Stack spacing={2.5}>
                <Stack spacing={1}>
                  <Typography variant="h4" fontWeight={800}>
                    {selectedQuiz.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {selectedQuiz.description ||
                      t("quizAccess.catalog.noDescription")}
                  </Typography>
                </Stack>

                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={1}
                  flexWrap="wrap"
                  useFlexGap
                >
                  <Chip
                    label={t("quizAccess.catalog.teacher", {
                      value: selectedQuiz.teacherName,
                    })}
                  />
                  <Chip
                    label={t("quizAccess.catalog.questionCount", {
                      count: selectedQuiz.totalQuestions,
                    })}
                  />
                  <Chip
                    label={t("quizAccess.catalog.totalPoints", {
                      count: selectedQuiz.totalPoints,
                    })}
                  />
                  <Chip
                    label={t("quizAccess.catalog.attemptsRemaining", {
                      remaining:
                        selectedQuiz.attemptsRemaining ??
                        selectedQuiz.attemptsAllowed,
                      max: selectedQuiz.attemptsAllowed,
                    })}
                  />
                  <Chip
                    label={
                      selectedQuiz.timeLimitMinutes
                        ? t("quizAccess.catalog.timeLimit", {
                            value: selectedQuiz.timeLimitMinutes,
                          })
                        : t("quizAccess.catalog.noTimeLimit")
                    }
                  />
                </Stack>

                <Stack spacing={0.5}>
                  <Typography variant="body2" color="text.secondary">
                    {t("quizAccess.catalog.startAt", {
                      value: formatDateTime(
                        selectedQuiz.startAt,
                        i18n.language,
                      ),
                    })}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t("quizAccess.catalog.endAt", {
                      value: formatDateTime(selectedQuiz.endAt, i18n.language),
                    })}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t("quizAccess.catalog.remainingAttemptsText", {
                      value: t("quizAccess.catalog.attemptsRemaining", {
                        remaining:
                          selectedQuiz.attemptsRemaining ??
                          selectedQuiz.attemptsAllowed,
                        max: selectedQuiz.attemptsAllowed,
                      }),
                    })}
                  </Typography>
                </Stack>

                {selectedQuiz.requiresAccessCode ? (
                  <TextField
                    label={t("quizAccess.fields.accessCode")}
                    value={accessCode}
                    onChange={(event) =>
                      setAccessCode(event.target.value.toUpperCase())
                    }
                    fullWidth
                  />
                ) : null}

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <Button
                    variant="contained"
                    onClick={() =>
                      void handleStartAttempt({
                        quizId: selectedQuiz.quizId,
                        accessCode: selectedQuiz.requiresAccessCode
                          ? accessCode
                          : null,
                      })
                    }
                    disabled={selectedQuizStartDisabled}
                  >
                    {t("quizAccess.actions.startSelectedQuiz")}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => navigate("/quiz-access")}
                  >
                    {t("quizAccess.actions.newLookup")}
                  </Button>
                </Stack>
              </Stack>
            )}
          </Paper>
        ) : null}

        {!activeAttempt && !result && !routeQuizId ? (
          <Paper
            variant="outlined"
            sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}
          >
            <Stack spacing={2}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                spacing={2}
                alignItems={{ md: "center" }}
              >
                <Stack spacing={0.5}>
                  <Typography variant="h5" fontWeight={700}>
                    {t("quizAccess.catalog.title")}
                  </Typography>
                  <Typography color="text.secondary">
                    {t("quizAccess.catalog.subtitleWithParticipant")}
                  </Typography>
                </Stack>
                <TextField
                  label={t("quizAccess.catalog.searchLabel")}
                  value={catalogSearch}
                  onChange={(event) => setCatalogSearch(event.target.value)}
                  fullWidth
                  sx={{ maxWidth: { xs: "100%", md: 360 } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRoundedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>

              {catalogLoading ? (
                <Typography color="text.secondary">
                  {t("common.loading")}
                </Typography>
              ) : filteredCatalog.length === 0 ? (
                <Typography color="text.secondary">
                  {t("quizAccess.catalog.empty")}
                </Typography>
              ) : (
                <>
                  <Stack spacing={2}>
                    {paginatedCatalog.map((quiz) => {
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
                          key={quiz.quizId}
                          variant="outlined"
                          sx={{
                            borderRadius: 3,
                            borderColor:
                              routeQuizId === quiz.quizId
                                ? "primary.main"
                                : "divider",
                          }}
                        >
                          <CardContent
                            sx={{
                              p: { xs: 3, md: 4 },
                              "&:last-child": { pb: { xs: 3, md: 4 } },
                            }}
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
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {quiz.description ||
                                      t("quizAccess.catalog.noDescription")}
                                  </Typography>
                                </Stack>
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  flexWrap="wrap"
                                  useFlexGap
                                >
                                  <Chip
                                    label={
                                      quiz.requiresAccessCode
                                        ? t("quizAccess.catalog.requiresCode")
                                        : t("quizAccess.catalog.openAccess")
                                    }
                                    color={
                                      quiz.requiresAccessCode
                                        ? "warning"
                                        : "success"
                                    }
                                  />
                                  <Chip
                                    label={
                                      quiz.isAvailableNow
                                        ? t("quizAccess.catalog.availableNow")
                                        : t(
                                            "quizAccess.catalog.notAvailableNow",
                                          )
                                    }
                                    color={
                                      quiz.isAvailableNow
                                        ? "success"
                                        : "default"
                                    }
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
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {t("quizAccess.catalog.startAt", {
                                    value: formatDateTime(
                                      quiz.startAt,
                                      i18n.language,
                                    ),
                                  })}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {t("quizAccess.catalog.endAt", {
                                    value: formatDateTime(
                                      quiz.endAt,
                                      i18n.language,
                                    ),
                                  })}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {t(
                                    "quizAccess.catalog.remainingAttemptsText",
                                    {
                                      value: attemptsRemainingLabel,
                                    },
                                  )}
                                </Typography>
                              </Stack>

                              <Stack
                                direction={{ xs: "column", sm: "row" }}
                                spacing={1.5}
                              >
                                <Button
                                  variant="contained"
                                  onClick={() =>
                                    navigate(`/quiz-access/${quiz.quizId}`)
                                  }
                                  disabled={
                                    !quiz.isAvailableNow ||
                                    quiz.attemptsRemaining === 0
                                  }
                                >
                                  {t("quizAccess.catalog.startButton")}
                                </Button>
                              </Stack>
                            </Stack>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </Stack>

                  <TablePagination
                    component="div"
                    count={filteredCatalog.length}
                    page={catalogPage}
                    onPageChange={(_, nextPage) => setCatalogPage(nextPage)}
                    rowsPerPage={catalogRowsPerPage}
                    onRowsPerPageChange={(event) => {
                      setCatalogRowsPerPage(
                        Number.parseInt(event.target.value, 10),
                      );
                      setCatalogPage(0);
                    }}
                    rowsPerPageOptions={QUIZ_ROWS_PER_PAGE_OPTIONS}
                    labelRowsPerPage={t("quizAccess.catalog.paginationLabel")}
                  />
                </>
              )}
            </Stack>
          </Paper>
        ) : null}

        {activeAttempt ? quizInfoCard : null}

        {activeAttempt ? (
          <Stack spacing={2.5}>
            {activeAttempt.questions.map((question, index) => (
              <Card
                key={question.questionId}
                variant="outlined"
                sx={{ borderRadius: 3 }}
              >
                <CardContent
                  sx={{
                    p: { xs: 3, md: 4 },
                    "&:last-child": { pb: { xs: 3, md: 4 } },
                  }}
                >
                  <Stack spacing={2}>
                    <Stack spacing={1.5}>
                      <Stack
                        direction={{ xs: "column", md: "row" }}
                        justifyContent="space-between"
                        spacing={1}
                      >
                        <Typography variant="h6" fontWeight={700}>
                          {t("quizAccess.questionTitle", { index: index + 1 })}
                        </Typography>
                        <Chip
                          label={t("quizAccess.pointsLabel", {
                            value: question.points,
                          })}
                        />
                      </Stack>
                      <MathText value={question.statement} emptyText="—" />
                    </Stack>

                    <Divider />

                    <Stack spacing={1.25}>
                      <FormLabel>{t("quizAccess.yourAnswer")}</FormLabel>
                      {renderQuestionInput(
                        question,
                        answers[question.questionId] ?? null,
                        (nextValue) => {
                          setAnswers((current) => ({
                            ...current,
                            [question.questionId]: nextValue,
                          }));
                        },
                        submitting,
                        t,
                      )}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}

            <Paper
              variant="outlined"
              sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}
            >
              <Stack
                direction={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                spacing={2}
                alignItems={{ md: "center" }}
              >
                <Typography color="text.secondary">
                  {t("quizAccess.questionCountSummary", {
                    count: questionCount,
                  })}
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => void handleSubmitAttempt()}
                  disabled={submitting}
                >
                  {t("quizAccess.actions.submitAttempt")}
                </Button>
              </Stack>
            </Paper>
          </Stack>
        ) : null}

        {result ? (
          <Stack spacing={2.5}>
            <Paper
              variant="outlined"
              sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}
            >
              <Stack spacing={1.25}>
                <Typography variant="h5" fontWeight={800}>
                  {result.title}
                </Typography>
                <Typography color="text.secondary">
                  {t("quizAccess.submittedAt", {
                    value: formatDateTime(result.submittedAt, i18n.language),
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
                      earned: result.earnedPoints,
                      max: result.maxPoints,
                    })}
                    color="primary"
                  />
                  <Chip
                    label={t("quizAccess.scoreOverTen", {
                      value: result.scoreOverTen,
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
                  <Card
                    key={review.questionId}
                    variant="outlined"
                    sx={{ borderRadius: 3 }}
                  >
                    <CardContent
                      sx={{
                        p: { xs: 3, md: 4 },
                        "&:last-child": { pb: { xs: 3, md: 4 } },
                      }}
                    >
                      <Stack spacing={1.5}>
                        <Stack
                          direction={{ xs: "column", md: "row" }}
                          justifyContent="space-between"
                          spacing={1}
                        >
                          <Stack spacing={0.5}>
                            <Typography variant="h6" fontWeight={700}>
                              {t("quizAccess.reviewTitle", {
                                index: index + 1,
                              })}
                            </Typography>
                            <Typography color="text.secondary">
                              {review.title}
                            </Typography>
                          </Stack>
                          <Stack
                            direction="row"
                            spacing={1}
                            flexWrap="wrap"
                            useFlexGap
                          >
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
                            <strong>
                              {t("quizAccess.submittedAnswerLabel")}:
                            </strong>{" "}
                            {formatAnswerValue(
                              review,
                              review.submittedValue,
                              t,
                            )}
                          </Typography>
                          <Typography variant="body2">
                            <strong>
                              {t("quizAccess.correctAnswerLabel")}:
                            </strong>{" "}
                            {formatAnswerValue(review, review.correctValue, t)}
                          </Typography>
                          {review.feedback ? (
                            <Typography variant="body2">
                              <strong>
                                {t("questions.fields.generalFeedback")}:
                              </strong>{" "}
                              {review.feedback}
                            </Typography>
                          ) : null}
                          {review.explanation ? (
                            <Typography variant="body2">
                              <strong>
                                {t("questions.fields.typeSpecificConfig")}:
                              </strong>{" "}
                              {review.explanation}
                            </Typography>
                          ) : null}
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Button
                variant="outlined"
                onClick={() => navigate("/quiz-access")}
              >
                {t("quizAccess.actions.newLookup")}
              </Button>
              {result.attemptsRemaining > 0 ? (
                <Button
                  variant="contained"
                  onClick={() => void handleStartAttempt()}
                  disabled={starting}
                >
                  {t("quizAccess.actions.startAnotherAttempt")}
                </Button>
              ) : null}
            </Stack>
          </Stack>
        ) : null}
      </Stack>
    </Box>
  );
}
