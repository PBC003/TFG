import { Alert, Box, Paper, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DeleteQuestionDialog } from "../../components/questions/DeleteQuestionDialog";
import { QuestionEditorDialog } from "../../components/questions/QuestionEditorDialog";
import {
  QuestionsFiltersCard,
  type QuestionTypeFilter,
} from "../../components/questions/QuestionsFiltersCard";
import { QuestionsHeaderCard } from "../../components/questions/QuestionsHeaderCard";
import { QuestionsMobileList } from "../../components/questions/QuestionsMobileList";
import { QuestionsTableView } from "../../components/questions/QuestionsTableView";
import { useAuth } from "../../hooks/useAuth";
import { questionsApi } from "../../services/questions/questions-api";
import type {
  CreateQuestionInput,
  QuestionItem,
  UpdateQuestionInput,
} from "../../types/question";
import { getErrorMessage } from "../../utils/error-code";

type FeedbackState = {
  severity: "success" | "error";
  message: string;
} | null;

const TYPE_FILTERS: QuestionTypeFilter[] = [
  "all",
  "true_false",
  "single_choice",
  "multiple_choice",
  "parametric",
];

export default function QuestionsPage() {
  const { t, i18n } = useTranslation();
  const auth = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<QuestionTypeFilter>("all");
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(
    null,
  );
  const [editorOpen, setEditorOpen] = useState(false);
  const [deletingQuestion, setDeletingQuestion] = useState<QuestionItem | null>(
    null,
  );

  const loadQuestions = useCallback(
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
    void loadQuestions();
  }, [loadQuestions]);

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

  const handleOpenCreateDialog = () => {
    setEditingQuestion(null);
    setEditorOpen(true);
  };

  const handleOpenEditDialog = (question: QuestionItem) => {
    setEditingQuestion(question);
    setEditorOpen(true);
  };

  const handleCloseEditor = () => {
    if (submitting) {
      return;
    }

    setEditorOpen(false);
    setEditingQuestion(null);
  };

  const handleEditorSubmit = async (
    payload: CreateQuestionInput | UpdateQuestionInput,
  ) => {
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
  };

  const handleDelete = async () => {
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
  };

  const getTypeFilterLabel = (value: QuestionTypeFilter) =>
    value === "all" ? t("common.all") : t(`questions.types.${value}`);

  const lastUpdatedLabel = (value: string) =>
    t("questions.lastUpdated", { value });

  return (
    <Box sx={{ width: "100%", maxWidth: 1180, mx: "auto" }}>
      <Box sx={{ display: "grid", gap: 3 }}>
        <QuestionsHeaderCard
          title={t("questions.title")}
          subtitle={t("questions.subtitle")}
          refreshLabel={t("common.refresh")}
          createLabel={t("questions.createAction")}
          loading={loading}
          submitting={submitting}
          onRefresh={() => void loadQuestions(t("questions.refreshSuccess"))}
          onCreate={handleOpenCreateDialog}
        />

        {feedback ? (
          <Alert severity={feedback.severity} onClose={() => setFeedback(null)}>
            {feedback.message}
          </Alert>
        ) : null}

        <QuestionsFiltersCard
          searchLabel={t("questions.searchPlaceholder")}
          searchValue={search}
          onSearchChange={setSearch}
          typeFilterLabel={t("questions.typeFilter")}
          typeFilterValue={typeFilter}
          onTypeFilterChange={setTypeFilter}
          typeFilters={TYPE_FILTERS}
          getTypeLabel={getTypeFilterLabel}
          totalVisibleText={t("questions.totalVisible", {
            count: visibleQuestions.length,
          })}
        />

        {loading ? (
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography color="text.secondary">
              {t("common.loading")}
            </Typography>
          </Paper>
        ) : visibleQuestions.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography color="text.secondary">
              {t("questions.empty")}
            </Typography>
          </Paper>
        ) : isMobile ? (
          <QuestionsMobileList
            questions={visibleQuestions}
            locale={i18n.language}
            noneLabel={t("common.none")}
            lastUpdatedLabel={lastUpdatedLabel}
            editLabel={t("common.edit")}
            deleteLabel={t("common.delete")}
            onEdit={handleOpenEditDialog}
            onDelete={setDeletingQuestion}
          />
        ) : (
          <QuestionsTableView
            questions={visibleQuestions}
            locale={i18n.language}
            headers={{
              title: t("questions.table.title"),
              type: t("questions.table.type"),
              tags: t("questions.table.tags"),
              version: t("questions.table.version"),
              updatedAt: t("questions.table.updatedAt"),
              actions: t("common.actions"),
            }}
            noneLabel={t("common.none")}
            editLabel={t("common.edit")}
            deleteLabel={t("common.delete")}
            onEdit={handleOpenEditDialog}
            onDelete={setDeletingQuestion}
          />
        )}

        {editorOpen ? (
          <QuestionEditorDialog
            key={editingQuestion?.questionId ?? "new"}
            open={editorOpen}
            question={editingQuestion}
            submitting={submitting}
            onClose={handleCloseEditor}
            onSubmit={handleEditorSubmit}
          />
        ) : null}

        <DeleteQuestionDialog
          question={deletingQuestion}
          open={Boolean(deletingQuestion)}
          submitting={submitting}
          title={t("questions.dialogs.deleteTitle")}
          description={t("questions.dialogs.deleteDescription")}
          cancelLabel={t("common.cancel")}
          confirmLabel={t("common.delete")}
          onClose={() => setDeletingQuestion(null)}
          onConfirm={() => void handleDelete()}
        />
      </Box>
    </Box>
  );
}
