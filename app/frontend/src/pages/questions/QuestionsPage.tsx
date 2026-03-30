import { Alert, Box, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { DeleteQuestionDialog } from "../../components/questions/DeleteQuestionDialog";
import { QuestionEditorDialog } from "../../components/questions/QuestionEditorDialog";
import {
  QuestionsFiltersCard,
  type QuestionTypeFilter,
} from "../../components/questions/QuestionsFiltersCard";
import { QuestionsHeaderCard } from "../../components/questions/QuestionsHeaderCard";
import { QuestionsPageContent } from "./components/QuestionsPageContent";
import { useQuestionsPage } from "./hooks/useQuestionsPage";

const TYPE_FILTERS: QuestionTypeFilter[] = [
  "all",
  "true_false",
  "single_choice",
  "multiple_choice",
  "parametric",
];

export default function QuestionsPage() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const {
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
  } = useQuestionsPage({ t });

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
          onRefresh={() => void refreshQuestions(t("questions.refreshSuccess"))}
          onCreate={openCreateDialog}
        />

        {feedback ? (
          <Alert severity={feedback.severity} onClose={clearFeedback}>
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

        <QuestionsPageContent
          loading={loading}
          isMobile={isMobile}
          questions={visibleQuestions}
          locale={i18n.language}
          noneLabel={t("common.none")}
          loadingLabel={t("common.loading")}
          emptyLabel={t("questions.empty")}
          editLabel={t("common.edit")}
          deleteLabel={t("common.delete")}
          tableHeaders={{
            title: t("questions.table.title"),
            type: t("questions.table.type"),
            tags: t("questions.table.tags"),
            version: t("questions.table.version"),
            updatedAt: t("questions.table.updatedAt"),
            actions: t("common.actions"),
          }}
          lastUpdatedLabel={lastUpdatedLabel}
          onEdit={openEditDialog}
          onDelete={openDeleteDialog}
        />

        {editorOpen ? (
          <QuestionEditorDialog
            key={editingQuestion?.questionId ?? "new"}
            open={editorOpen}
            question={editingQuestion}
            submitting={submitting}
            onClose={closeEditor}
            onSubmit={submitEditor}
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
          onClose={closeDeleteDialog}
          onConfirm={() => void confirmDelete()}
        />
      </Box>
    </Box>
  );
}
