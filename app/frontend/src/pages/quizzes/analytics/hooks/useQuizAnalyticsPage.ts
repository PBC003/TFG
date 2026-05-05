import type { TFunction } from "i18next";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../../hooks/useAuth";
import { quizAnalyticsApi } from "../../../../services/quizzes/quiz-analytics-api";
import type {
  QuizAnalyticsItem,
  QuizAttemptReviewDetail,
} from "../../../../types/quiz";
import { getErrorMessage } from "../../../../utils/error-code";
import {
  DEFAULT_ATTEMPTS_ROWS_PER_PAGE,
  downloadCsvFile,
  filterAttemptsByParticipant,
  paginateItems,
} from "../utils/quiz-analytics.utils";

export function useQuizAnalyticsPage({
  quizId,
  t,
}: {
  quizId: string;
  t: TFunction;
}) {
  const auth = useAuth();
  const [analytics, setAnalytics] = useState<QuizAnalyticsItem | null>(null);
  const [detail, setDetail] = useState<QuizAttemptReviewDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [attemptSearch, setAttemptSearch] = useState("");
  const [attemptsPage, setAttemptsPage] = useState(0);
  const [attemptsRowsPerPage, setAttemptsRowsPerPage] = useState(
    DEFAULT_ATTEMPTS_ROWS_PER_PAGE,
  );
  const [feedback, setFeedback] = useState<{
    severity: "error" | "success";
    message: string;
  } | null>(null);

  const loadAnalytics = useCallback(async () => {
    if (!quizId) {
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const response = await auth.executeWithSession((token) =>
        quizAnalyticsApi.getQuizAnalytics(token, quizId),
      );
      setAnalytics(response.analytics);
    } catch (error) {
      setFeedback({ severity: "error", message: getErrorMessage(t, error) });
    } finally {
      setLoading(false);
    }
  }, [auth, quizId, t]);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  const handleOpenDetail = useCallback(
    async (attemptId: string) => {
      setDetailLoading(true);
      setFeedback(null);

      try {
        const response = await auth.executeWithSession((token) =>
          quizAnalyticsApi.getAttemptDetail(token, quizId, attemptId),
        );
        setDetail(response.detail);
      } catch (error) {
        setFeedback({ severity: "error", message: getErrorMessage(t, error) });
      } finally {
        setDetailLoading(false);
      }
    },
    [auth, quizId, t],
  );

  const handleExport = useCallback(async () => {
    if (!analytics) {
      return;
    }

    setExporting(true);
    setFeedback(null);

    try {
      const csv = await auth.executeWithSession((token) =>
        quizAnalyticsApi.exportQuizCsv(token, analytics.quizId),
      );
      downloadCsvFile(`quiz-${analytics.quizId}-results.csv`, csv);
      setFeedback({
        severity: "success",
        message: t("quizAnalytics.exportSuccess"),
      });
    } catch (error) {
      setFeedback({ severity: "error", message: getErrorMessage(t, error) });
    } finally {
      setExporting(false);
    }
  }, [analytics, auth, t]);

  const filteredAttempts = useMemo(
    () => filterAttemptsByParticipant(analytics?.attempts ?? [], attemptSearch),
    [analytics?.attempts, attemptSearch],
  );

  useEffect(() => {
    setAttemptsPage(0);
  }, [attemptSearch]);

  useEffect(() => {
    const lastPage = Math.max(
      0,
      Math.ceil(filteredAttempts.length / attemptsRowsPerPage) - 1,
    );
    setAttemptsPage((current) => (current > lastPage ? lastPage : current));
  }, [filteredAttempts.length, attemptsRowsPerPage]);

  const paginatedAttempts = useMemo(
    () => paginateItems(filteredAttempts, attemptsPage, attemptsRowsPerPage),
    [attemptsPage, attemptsRowsPerPage, filteredAttempts],
  );

  const distributionLabels = useMemo(
    () => [
      t("quizAnalytics.distributionBuckets.failed"),
      t("quizAnalytics.distributionBuckets.pass"),
      t("quizAnalytics.distributionBuckets.notable"),
      t("quizAnalytics.distributionBuckets.excellent"),
    ],
    [t],
  );

  return {
    analytics,
    detail,
    loading,
    exporting,
    detailLoading,
    attemptSearch,
    attemptsPage,
    attemptsRowsPerPage,
    feedback,
    filteredAttempts,
    paginatedAttempts,
    distributionLabels,
    setAttemptSearch,
    setAttemptsPage,
    setAttemptsRowsPerPage,
    setDetail,
    setFeedback,
    loadAnalytics,
    handleOpenDetail,
    handleExport,
  };
}
