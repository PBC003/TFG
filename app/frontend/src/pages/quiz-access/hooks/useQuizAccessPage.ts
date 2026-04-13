import type { TFunction } from "i18next";
import { useCallback, useEffect, useMemo, useState } from "react";
import { quizAccessApi } from "../../../services/quizzes/quiz-access-api";
import type { QuizAnswerValue } from "../../../types/quiz";
import { getErrorMessage } from "../../../utils/error-code";
import type {
  QuizAccessFeedback,
  StartAttemptOptions,
  UseQuizAccessPageResult,
} from "../types/quiz-access-page.types";
import {
  buildSubmitAnswersPayload,
  getCanRequestBestResult,
  getSelectedQuizStartDisabled,
  normalizeStartAttemptPayload,
  shouldAutoSubmitExpiredAttempt,
} from "../utils/quiz-access-page.logic";
import {
  filterAndSortQuizCatalog,
  paginateQuizCatalog,
} from "../utils/quiz-access.utils";

type UseQuizAccessPageParams = {
  routeQuizId?: string;
  participantIdentity: string;
  t: TFunction;
};

export function useQuizAccessPage({
  routeQuizId,
  participantIdentity,
  t,
}: UseQuizAccessPageParams): UseQuizAccessPageResult {
  const [accessCode, setAccessCode] = useState("");
  const [catalogSearch, setCatalogSearch] = useState("");
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [feedback, setFeedback] = useState<QuizAccessFeedback>(null);
  const [activeAttempt, setActiveAttempt] =
    useState<UseQuizAccessPageResult["activeAttempt"]>(null);
  const [answers, setAnswers] = useState<UseQuizAccessPageResult["answers"]>(
    {},
  );
  const [result, setResult] = useState<UseQuizAccessPageResult["result"]>(null);
  const [publicQuizzes, setPublicQuizzes] = useState<
    UseQuizAccessPageResult["publicQuizzes"]
  >([]);
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

  const filteredCatalog = useMemo(
    () => filterAndSortQuizCatalog(publicQuizzes, catalogSearch, routeQuizId),
    [catalogSearch, publicQuizzes, routeQuizId],
  );

  useEffect(() => {
    setCatalogPage(0);
  }, [catalogSearch, publicQuizzes, routeQuizId]);

  const paginatedCatalog = useMemo(
    () => paginateQuizCatalog(filteredCatalog, catalogPage, catalogRowsPerPage),
    [catalogPage, catalogRowsPerPage, filteredCatalog],
  );

  const handleStartAttempt = useCallback(
    async (options?: StartAttemptOptions) => {
      const { quizId: normalizedQuizId, accessCode: normalizedAccessCode } =
        normalizeStartAttemptPayload(options, routeQuizId, accessCode);

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

  const handleLoadBestResult = useCallback(
    async (quizId?: string) => {
      const normalizedQuizId = quizId ?? routeQuizId ?? selectedQuiz?.quizId;

      if (!normalizedQuizId || !participantIdentity) {
        setFeedback({
          severity: "info",
          message: t("quizAccess.bestResultUnavailable"),
        });
        return;
      }

      setReviewLoading(true);
      setFeedback(null);

      try {
        const response = await quizAccessApi.getBestResult(
          normalizedQuizId,
          participantIdentity,
        );

        if (!response.result) {
          setFeedback({
            severity: "info",
            message: t("quizAccess.bestResultUnavailable"),
          });
          return;
        }

        setActiveAttempt(null);
        setAnswers({});
        setResult(response.result);
      } catch (error) {
        setFeedback({ severity: "error", message: getErrorMessage(t, error) });
      } finally {
        setReviewLoading(false);
      }
    },
    [participantIdentity, routeQuizId, selectedQuiz?.quizId, t],
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
          answers: buildSubmitAnswersPayload(answers),
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
      !shouldAutoSubmitExpiredAttempt({
        activeAttempt,
        autoSubmitTriggered,
        submitting,
        result,
        nowMs,
      })
    ) {
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

  const selectedQuizStartDisabled = getSelectedQuizStartDisabled({
    starting,
    participantIdentity,
    selectedQuiz,
    accessCode,
  });

  const canRequestBestResult = getCanRequestBestResult(
    selectedQuiz,
    participantIdentity,
  );

  const updateAnswer = useCallback(
    (questionId: string, value: QuizAnswerValue) => {
      setAnswers((current) => ({
        ...current,
        [questionId]: value,
      }));
    },
    [],
  );

  const resetLookup = useCallback(() => {
    setAccessCode("");
    setResult(null);
    setFeedback(null);
    setActiveAttempt(null);
    setAnswers({});
    setAutoSubmitTriggered(false);
  }, []);

  return {
    accessCode,
    catalogSearch,
    starting,
    submitting,
    reviewLoading,
    catalogLoading,
    feedback,
    activeAttempt,
    answers,
    result,
    publicQuizzes,
    catalogPage,
    catalogRowsPerPage,
    nowMs,
    selectedQuiz,
    filteredCatalog,
    paginatedCatalog,
    questionCount: activeAttempt?.questions.length ?? 0,
    selectedQuizStartDisabled,
    canRequestBestResult,
    setAccessCode,
    setCatalogSearch,
    setCatalogPage,
    setCatalogRowsPerPage,
    setFeedback,
    updateAnswer,
    refreshCatalog,
    handleStartAttempt,
    handleSubmitAttempt,
    handleLoadBestResult,
    resetLookup,
  };
}
