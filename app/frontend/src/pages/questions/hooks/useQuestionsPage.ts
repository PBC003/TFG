import type { TFunction } from "i18next";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { QuestionTypeFilter } from "../../../components/questions/list/QuestionsFiltersCard";
import { useAuth } from "../../../hooks/useAuth";
import { questionsApi } from "../../../services/questions/questions-api";
import type {
  CreateQuestionInput,
  QuestionItem,
  UpdateQuestionInput,
} from "../../../types/question";
import { getErrorMessage } from "../../../utils/error-code";
import type {
  QuestionsPageFeedbackState,
  UseQuestionsPageResult,
} from "../types/questions-page.types";

export function useQuestionsPage({
  t,
}: {
  t: TFunction;
}): UseQuestionsPageResult {
  const auth = useAuth();
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<QuestionsPageFeedbackState>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<QuestionTypeFilter>("all");
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(
    null,
  );
  const [editorOpen, setEditorOpen] = useState(false);
  const [deletingQuestion, setDeletingQuestion] = useState<QuestionItem | null>(
    null,
  );

  const refreshQuestions = useCallback(
    async (successMessage?: string) => {
      setLoading(true);

      try {
        const response = await auth.executeWithSession((token) =>
          questionsApi.listQuestions(token),
        );
        setQuestions(response.questions);

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
    void refreshQuestions();
  }, [refreshQuestions]);

  const visibleQuestions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return questions.filter((question) => {
      const matchesSearch =
        !normalizedSearch ||
        question.title.toLowerCase().includes(normalizedSearch) ||
        question.statement.toLowerCase().includes(normalizedSearch) ||
        question.tags.some((tag) =>
          tag.toLowerCase().includes(normalizedSearch),
        ) ||
        question.questionId.toLowerCase().includes(normalizedSearch);

      const matchesType = typeFilter === "all" || question.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [questions, search, typeFilter]);

  const openCreateDialog = useCallback(() => {
    setEditingQuestion(null);
    setEditorOpen(true);
  }, []);

  const openEditDialog = useCallback((question: QuestionItem) => {
    setEditingQuestion(question);
    setEditorOpen(true);
  }, []);

  const closeEditor = useCallback(() => {
    if (submitting) {
      return;
    }

    setEditorOpen(false);
    setEditingQuestion(null);
  }, [submitting]);

  const submitEditor = useCallback(
    async (payload: CreateQuestionInput | UpdateQuestionInput) => {
      setSubmitting(true);

      try {
        if (editingQuestion) {
          const response = await auth.executeWithSession((token) =>
            questionsApi.updateQuestion(
              token,
              editingQuestion.questionId,
              payload,
            ),
          );
          setQuestions((current) =>
            current.map((question) =>
              question.questionId === response.question.questionId
                ? response.question
                : question,
            ),
          );
          setFeedback({
            severity: "success",
            message: t("questions.updateSuccess"),
          });
        } else {
          const response = await auth.executeWithSession((token) =>
            questionsApi.createQuestion(token, payload as CreateQuestionInput),
          );
          setQuestions((current) => [response.question, ...current]);
          setFeedback({
            severity: "success",
            message: t("questions.createSuccess"),
          });
        }

        setEditorOpen(false);
        setEditingQuestion(null);
      } catch (error) {
        setFeedback({ severity: "error", message: getErrorMessage(t, error) });
      } finally {
        setSubmitting(false);
      }
    },
    [auth, editingQuestion, t],
  );

  const openDeleteDialog = useCallback((question: QuestionItem) => {
    setDeletingQuestion(question);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    if (submitting) {
      return;
    }

    setDeletingQuestion(null);
  }, [submitting]);

  const confirmDelete = useCallback(async () => {
    if (!deletingQuestion) {
      return;
    }

    setSubmitting(true);

    try {
      await auth.executeWithSession((token) =>
        questionsApi.deleteQuestion(token, deletingQuestion.questionId),
      );
      setQuestions((current) =>
        current.filter(
          (question) => question.questionId !== deletingQuestion.questionId,
        ),
      );
      setFeedback({
        severity: "success",
        message: t("questions.deleteSuccess"),
      });
      setDeletingQuestion(null);
    } catch (error) {
      setFeedback({ severity: "error", message: getErrorMessage(t, error) });
    } finally {
      setSubmitting(false);
    }
  }, [auth, deletingQuestion, t]);

  const clearFeedback = useCallback(() => {
    setFeedback(null);
  }, []);

  return {
    questions,
    visibleQuestions,
    loading,
    submitting,
    feedback,
    search,
    typeFilter,
    editorOpen,
    editingQuestion,
    deletingQuestion,
    setSearch,
    setTypeFilter,
    clearFeedback,
    openCreateDialog,
    openEditDialog,
    closeEditor,
    submitEditor,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete,
    refreshQuestions,
  };
}
