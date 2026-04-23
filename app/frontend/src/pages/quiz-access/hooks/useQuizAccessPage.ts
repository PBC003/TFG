import type { TFunction } from "i18next";
import { useCallback, useEffect, useState } from "react";
import type { AuthContextValue } from "../../../context/AuthContext";
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
import { useQuizAccessCatalog } from "./useQuizAccessCatalog";

type UseQuizAccessPageParams = {
  routeQuizId?: string;
  isAuthenticated: boolean;
  executeWithSession: AuthContextValue["executeWithSession"];
  t: TFunction;
};

export function useQuizAccessPage({
  routeQuizId,
  isAuthenticated,
  executeWithSession,
  t,
}: UseQuizAccessPageParams): UseQuizAccessPageResult {
  const [accessCode, setAccessCode] = useState("");
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [feedback, setFeedback] = useState<QuizAccessFeedback>(null);
  const [activeAttempt, setActiveAttempt] =
    useState<UseQuizAccessPageResult["activeAttempt"]>(null);
  const [answers, setAnswers] = useState<UseQuizAccessPageResult["answers"]>(
    {},
  );
  const [result, setResult] = useState<UseQuizAccessPageResult["result"]>(null);
  const [nowMs, setNowMs] = useState(Date.now());
  const [autoSubmitTriggered, setAutoSubmitTriggered] = useState(false);

  const handleCatalogError = useCallback((message: string) => {
    setFeedback({ severity: "error", message });
  }, []);

  const catalog = useQuizAccessCatalog({
    routeQuizId,
    isAuthenticated,
    executeWithSession,
    t,
    onError: handleCatalogError,
  });

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

  const handleStartAttempt = useCallback(
    async (options?: StartAttemptOptions) => {
      const { quizId: normalizedQuizId, accessCode: normalizedAccessCode } =
        normalizeStartAttemptPayload(options, routeQuizId, accessCode);

      if (!isAuthenticated) {
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
        const response = await executeWithSession((token) =>
          quizAccessApi.startAttempt(token, {
            quizId: normalizedQuizId,
            accessCode: normalizedAccessCode || null,
          }),
        );
        setActiveAttempt(response.attempt);
        setAnswers({});
        setResult(null);
        setAutoSubmitTriggered(false);
        setNowMs(Date.now());
        await catalog.refreshCatalog();
      } catch (error) {
        setFeedback({ severity: "error", message: getErrorMessage(t, error) });
      } finally {
        setStarting(false);
      }
    },
    [accessCode, catalog, executeWithSession, isAuthenticated, routeQuizId, t],
  );

  const handleLoadBestResult = useCallback(
    async (quizId?: string) => {
      const normalizedQuizId =
        quizId ?? routeQuizId ?? catalog.selectedQuiz?.quizId;

      if (!normalizedQuizId || !isAuthenticated) {
        setFeedback({
          severity: "info",
          message: t("quizAccess.bestResultUnavailable"),
        });
        return;
      }

      setReviewLoading(true);
      setFeedback(null);

      try {
        const response = await executeWithSession((token) =>
          quizAccessApi.getBestResult(token, normalizedQuizId),
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
    [
      catalog.selectedQuiz?.quizId,
      executeWithSession,
      isAuthenticated,
      routeQuizId,
      t,
    ],
  );

  const handleSubmitAttempt = useCallback(async () => {
    if (!activeAttempt) {
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const response = await executeWithSession((token) =>
        quizAccessApi.submitAttempt(token, activeAttempt.attemptId, {
          answers: buildSubmitAnswersPayload(answers),
        }),
      );
      setResult(response.result);
      setActiveAttempt(null);
      setAutoSubmitTriggered(false);
      setFeedback({
        severity: "success",
        message: t("quizAccess.submitSuccess"),
      });
      await catalog.refreshCatalog();
    } catch (error) {
      setFeedback({ severity: "error", message: getErrorMessage(t, error) });
    } finally {
      setSubmitting(false);
    }
  }, [activeAttempt, answers, catalog, executeWithSession, t]);

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
    isAuthenticated,
    selectedQuiz: catalog.selectedQuiz,
    accessCode,
  });

  const canRequestBestResult = getCanRequestBestResult(
    catalog.selectedQuiz,
    isAuthenticated,
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
    catalogSearch: catalog.catalogSearch,
    starting,
    submitting,
    reviewLoading,
    catalogLoading: catalog.catalogLoading,
    feedback,
    activeAttempt,
    answers,
    result,
    publicQuizzes: catalog.publicQuizzes,
    catalogPage: catalog.catalogPage,
    catalogRowsPerPage: catalog.catalogRowsPerPage,
    nowMs,
    selectedQuiz: catalog.selectedQuiz,
    filteredCatalog: catalog.filteredCatalog,
    paginatedCatalog: catalog.paginatedCatalog,
    questionCount: activeAttempt?.questions.length ?? 0,
    selectedQuizStartDisabled,
    canRequestBestResult,
    setAccessCode,
    setCatalogSearch: catalog.setCatalogSearch,
    setCatalogPage: catalog.setCatalogPage,
    setCatalogRowsPerPage: catalog.setCatalogRowsPerPage,
    setFeedback,
    updateAnswer,
    refreshCatalog: catalog.refreshCatalog,
    handleStartAttempt,
    handleSubmitAttempt,
    handleLoadBestResult,
    resetLookup,
  };
}
