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

export function useQuizzesPage({ t }: { t: TFunction }): UseQuizzesPageResult {
  const auth = useAuth();
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [questionBank, setQuestionBank] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] =
    useState<UseQuizzesPageResult["feedback"]>(null);
  const [search, setSearch] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<QuizItem | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "draft" | "published"
  >("all");

  const refreshQuizzes = useCallback(
    async (successMessage?: string) => {
      setLoading(true);

      try {
        const [quizzesResponse, questionsResponse] = await Promise.all([
          auth.executeWithSession((token) => quizzesApi.listQuizzes(token)),
          auth.executeWithSession((token) => questionsApi.listQuestions(token)),
        ]);

        setQuizzes(quizzesResponse.quizzes);
        setQuestionBank(questionsResponse.questions);

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

  useEffect(() => {
    void refreshQuizzes();
  }, [refreshQuizzes]);

  const visibleQuizzes = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return quizzes.filter((quiz) => {
      const matchesStatus =
        statusFilter === "all" || quiz.status === statusFilter;
      if (!matchesStatus) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return (
        quiz.title.toLowerCase().includes(normalizedSearch) ||
        (quiz.description ?? "").toLowerCase().includes(normalizedSearch) ||
        (quiz.accessCode ?? "").toLowerCase().includes(normalizedSearch) ||
        quiz.status.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [quizzes, search, statusFilter]);

  const openCreateDialog = useCallback(() => {
    setEditingQuiz(null);
    setEditorOpen(true);
  }, []);

  const openEditDialog = useCallback(
    (quiz: QuizItem) => {
      if (!quiz.canEdit) {
        setFeedback({ severity: "info", message: t("quizzes.editLocked") });
        return;
      }

      setEditingQuiz(quiz);
      setEditorOpen(true);
    },
    [t],
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

          setQuizzes((current) =>
            current.map((quiz) =>
              quiz.quizId === response.quiz.quizId ? response.quiz : quiz,
            ),
          );
          setFeedback({
            severity: "success",
            message: t("quizzes.updateSuccess"),
          });
        } else {
          const response = await auth.executeWithSession((token) =>
            quizzesApi.createQuiz(token, payload as CreateQuizInput),
          );

          setQuizzes((current) => [response.quiz, ...current]);
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

        setQuizzes((current) =>
          current.map((candidate) =>
            candidate.quizId === response.quiz.quizId
              ? response.quiz
              : candidate,
          ),
        );
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
      const quizAccessUrl = `${window.location.origin}/quiz-access/${quiz.quizId}`;

      try {
        await navigator.clipboard.writeText(quizAccessUrl);
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
        setQuizzes((current) =>
          current.filter((candidate) => candidate.quizId !== quiz.quizId),
        );
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
    questionBank,
    loading,
    submitting,
    feedback,
    search,
    statusFilter,
    editorOpen,
    editingQuiz,
    setSearch,
    setStatusFilter,
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
