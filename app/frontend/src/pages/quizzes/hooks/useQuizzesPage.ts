import type { TFunction } from "i18next";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { questionsApi } from "../../../services/questions/questions-api";
import { quizzesApi } from "../../../services/quizzes/quizzes-api";
import type { QuestionItem } from "../../../types/question";
import type {
  CreateQuizInput,
  QuizItem,
  UpdateQuizInput,
} from "../../../types/quiz";
import { getErrorMessage } from "../../../utils/error-code";
import type { UseQuizzesPageResult } from "../types/quizzes-page.types";
import {
  buildQuizAccessUrl,
  filterQuizzes,
  paginateItems,
  prependQuizItem,
  removeQuizItem,
  replaceQuizItem,
} from "../utils/quizzes-page.utils";

const DEFAULT_ROWS_PER_PAGE = 5;

export function useQuizzesPage({ t }: { t: TFunction }): UseQuizzesPageResult {
  const auth = useAuth();
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [questionBank, setQuestionBank] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [questionBankLoading, setQuestionBankLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] =
    useState<UseQuizzesPageResult["feedback"]>(null);
  const [search, setSearch] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<QuizItem | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "draft" | "published"
  >("all");
  const [page, setPageState] = useState(0);
  const [rowsPerPage, setRowsPerPageState] = useState(DEFAULT_ROWS_PER_PAGE);

  const refreshQuizzes = useCallback(
    async (successMessage?: string) => {
      setLoading(true);

      try {
        const response = await auth.executeWithSession((token) =>
          quizzesApi.listQuizzes(token),
        );

        setQuizzes(response.quizzes);

        if (successMessage) {
          setFeedback({ severity: "success", message: successMessage });
        }
      } catch (error) {
        setFeedback({ severity: "error", message: getErrorMessage(t, error) });
      } finally {
        setLoading(false);
      }
    },
    [auth, t],
  );

  const ensureQuestionBankLoaded = useCallback(async () => {
    if (questionBank.length > 0 || questionBankLoading) {
      return;
    }

    setQuestionBankLoading(true);

    try {
      const response = await auth.executeWithSession((token) =>
        questionsApi.listQuestions(token),
      );
      setQuestionBank(response.questions);
    } catch (error) {
      setFeedback({ severity: "error", message: getErrorMessage(t, error) });
    } finally {
      setQuestionBankLoading(false);
    }
  }, [auth, questionBank.length, questionBankLoading, t]);

  useEffect(() => {
    void refreshQuizzes();
  }, [refreshQuizzes]);

  const visibleQuizzes = useMemo(
    () => filterQuizzes(quizzes, search, statusFilter),
    [quizzes, search, statusFilter],
  );

  useEffect(() => {
    setPageState(0);
  }, [search, statusFilter]);

  useEffect(() => {
    const lastPage = Math.max(
      0,
      Math.ceil(visibleQuizzes.length / rowsPerPage) - 1,
    );
    setPageState((current) => (current > lastPage ? lastPage : current));
  }, [visibleQuizzes.length, rowsPerPage]);

  const paginatedQuizzes = useMemo(
    () => paginateItems(visibleQuizzes, page, rowsPerPage),
    [page, rowsPerPage, visibleQuizzes],
  );

  const setPage = useCallback((value: number) => {
    setPageState(value);
  }, []);

  const setRowsPerPage = useCallback((value: number) => {
    setRowsPerPageState(value);
    setPageState(0);
  }, []);

  const openCreateDialog = useCallback(() => {
    setEditingQuiz(null);
    setEditorOpen(true);
    void ensureQuestionBankLoaded();
  }, [ensureQuestionBankLoaded]);

  const openEditDialog = useCallback(
    (quiz: QuizItem) => {
      if (!quiz.canEdit) {
        setFeedback({ severity: "info", message: t("quizzes.editLocked") });
        return;
      }

      setEditingQuiz(quiz);
      setEditorOpen(true);
      void ensureQuestionBankLoaded();
    },
    [ensureQuestionBankLoaded, t],
  );

  const closeEditor = useCallback(() => {
    if (submitting) {
      return;
    }

    setEditorOpen(false);
    setEditingQuiz(null);
  }, [submitting]);

  const submitEditor = useCallback(
    async (payload: CreateQuizInput | UpdateQuizInput) => {
      setSubmitting(true);

      try {
        if (editingQuiz) {
          const response = await auth.executeWithSession((token) =>
            quizzesApi.updateQuiz(token, editingQuiz.quizId, payload),
          );

          setQuizzes((current) => replaceQuizItem(current, response.quiz));
          setFeedback({
            severity: "success",
            message: t("quizzes.updateSuccess"),
          });
        } else {
          const response = await auth.executeWithSession((token) =>
            quizzesApi.createQuiz(token, payload as CreateQuizInput),
          );

          setQuizzes((current) => prependQuizItem(current, response.quiz));
          setFeedback({
            severity: "success",
            message: t("quizzes.createSuccess"),
          });
        }

        setEditorOpen(false);
        setEditingQuiz(null);
      } catch (error) {
        setFeedback({ severity: "error", message: getErrorMessage(t, error) });
      } finally {
        setSubmitting(false);
      }
    },
    [auth, editingQuiz, t],
  );

  const togglePublishStatus = useCallback(
    async (quiz: QuizItem) => {
      setSubmitting(true);

      try {
        const response = await auth.executeWithSession((token) =>
          quiz.status === "published"
            ? quizzesApi.unpublishQuiz(token, quiz.quizId)
            : quizzesApi.publishQuiz(token, quiz.quizId),
        );

        setQuizzes((current) => replaceQuizItem(current, response.quiz));
        setFeedback({
          severity: "success",
          message:
            quiz.status === "published"
              ? t("quizzes.unpublishSuccess")
              : t("quizzes.publishSuccess"),
        });
      } catch (error) {
        setFeedback({ severity: "error", message: getErrorMessage(t, error) });
      } finally {
        setSubmitting(false);
      }
    },
    [auth, t],
  );

  const copyAccessLink = useCallback(
    async (quiz: QuizItem) => {
      try {
        await navigator.clipboard.writeText(buildQuizAccessUrl(quiz.quizId));
        setFeedback({
          severity: "success",
          message: t("quizzes.copyLinkSuccess"),
        });
      } catch {
        setFeedback({ severity: "error", message: t("errors.generic") });
      }
    },
    [t],
  );

  const deleteQuiz = useCallback(
    async (quiz: QuizItem) => {
      if (!quiz.canDelete) {
        setFeedback({ severity: "info", message: t("quizzes.deleteLocked") });
        return;
      }

      const confirmed = window.confirm(
        t("quizzes.confirmDelete", { title: quiz.title }),
      );
      if (!confirmed) {
        return;
      }

      setSubmitting(true);

      try {
        await auth.executeWithSession((token) =>
          quizzesApi.deleteQuiz(token, quiz.quizId),
        );
        setQuizzes((current) => removeQuizItem(current, quiz.quizId));
        setFeedback({
          severity: "success",
          message: t("quizzes.deleteSuccess"),
        });
      } catch (error) {
        setFeedback({ severity: "error", message: getErrorMessage(t, error) });
      } finally {
        setSubmitting(false);
      }
    },
    [auth, t],
  );

  const clearFeedback = useCallback(() => {
    setFeedback(null);
  }, []);

  return {
    quizzes,
    visibleQuizzes,
    paginatedQuizzes,
    questionBank,
    loading,
    questionBankLoading,
    submitting,
    feedback,
    search,
    statusFilter,
    editorOpen,
    editingQuiz,
    page,
    rowsPerPage,
    setSearch,
    setStatusFilter,
    setPage,
    setRowsPerPage,
    clearFeedback,
    openCreateDialog,
    openEditDialog,
    closeEditor,
    submitEditor,
    togglePublishStatus,
    copyAccessLink,
    deleteQuiz,
    refreshQuizzes,
  };
}
