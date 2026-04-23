import type { TFunction } from "i18next";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { AuthContextValue } from "../../../context/AuthContext";
import { quizAccessApi } from "../../../services/quizzes/quiz-access-api";
import { getErrorMessage } from "../../../utils/error-code";
import {
  filterAndSortQuizCatalog,
  paginateQuizCatalog,
} from "../utils/quiz-access.utils";
import type { UseQuizAccessPageResult } from "../types/quiz-access-page.types";

export type UseQuizAccessCatalogParams = {
  routeQuizId?: string;
  isAuthenticated: boolean;
  executeWithSession: AuthContextValue["executeWithSession"];
  t: TFunction;
  onError: (message: string) => void;
};

export function useQuizAccessCatalog({
  routeQuizId,
  isAuthenticated,
  executeWithSession,
  t,
  onError,
}: UseQuizAccessCatalogParams) {
  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [publicQuizzes, setPublicQuizzes] = useState<
    UseQuizAccessPageResult["publicQuizzes"]
  >([]);
  const [catalogPage, setCatalogPage] = useState(0);
  const [catalogRowsPerPage, setCatalogRowsPerPage] = useState(5);

  const refreshCatalog = useCallback(async () => {
    if (!isAuthenticated) {
      setPublicQuizzes([]);
      setCatalogLoading(false);
      return;
    }

    setCatalogLoading(true);

    try {
      const response = await executeWithSession((token) =>
        quizAccessApi.listPublishedQuizzes(token),
      );
      setPublicQuizzes(response.quizzes);
    } catch (error) {
      onError(getErrorMessage(t, error));
    } finally {
      setCatalogLoading(false);
    }
  }, [executeWithSession, isAuthenticated, onError, t]);

  useEffect(() => {
    if (!isAuthenticated) {
      setCatalogLoading(false);
      setPublicQuizzes([]);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void refreshCatalog();
    }, 150);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isAuthenticated, refreshCatalog]);

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

  return {
    catalogSearch,
    setCatalogSearch,
    catalogLoading,
    publicQuizzes,
    catalogPage,
    setCatalogPage,
    catalogRowsPerPage,
    setCatalogRowsPerPage,
    refreshCatalog,
    selectedQuiz,
    filteredCatalog,
    paginatedCatalog,
  };
}
