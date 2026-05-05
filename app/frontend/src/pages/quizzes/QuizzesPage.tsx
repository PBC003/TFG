import { Alert, Box, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { getQuizSimulationRoute } from "../../constants/routes";
import { QuizEditorDialog } from "./components/QuizEditorDialog";
import { QuizzesFiltersCard } from "./components/QuizzesFiltersCard";
import { QuizzesPageHeaderCard } from "./components/QuizzesPageHeaderCard";
import { QuizzesTableCard } from "./components/QuizzesTableCard";
import { useQuizzesPage } from "./hooks/useQuizzesPage";

export default function QuizzesPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const {
    visibleQuizzes,
    paginatedQuizzes,
    questionBank,
    groups,
    loading,
    questionBankLoading,
    groupsLoading,
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
  } = useQuizzesPage({ t });

  return (
    <Box sx={{ width: "100%", maxWidth: 1240, mx: "auto" }}>
      <Stack spacing={3}>
        <QuizzesPageHeaderCard
          loading={loading}
          submitting={submitting}
          onRefresh={() => refreshQuizzes(t("quizzes.refreshSuccess"))}
          onCreate={openCreateDialog}
        />

        {feedback ? (
          <Alert severity={feedback.severity} onClose={clearFeedback}>
            {feedback.message}
          </Alert>
        ) : null}

        <QuizzesFiltersCard
          search={search}
          statusFilter={statusFilter}
          visibleCount={visibleQuizzes.length}
          onSearchChange={setSearch}
          onStatusFilterChange={setStatusFilter}
        />

        <QuizzesTableCard
          loading={loading}
          submitting={submitting}
          quizzes={paginatedQuizzes}
          totalQuizzes={visibleQuizzes.length}
          page={page}
          rowsPerPage={rowsPerPage}
          language={i18n.language}
          onPageChange={setPage}
          onRowsPerPageChange={setRowsPerPage}
          onEdit={openEditDialog}
          onCopyLink={copyAccessLink}
          onTogglePublishStatus={togglePublishStatus}
          onDelete={deleteQuiz}
          onOpenAnalytics={(quiz) =>
            navigate(`/quizzes/${quiz.quizId}/analytics`)
          }
          onStartSimulation={(quiz) =>
            navigate(getQuizSimulationRoute(quiz.quizId))
          }
        />

        {editorOpen ? (
          <QuizEditorDialog
            key={editingQuiz?.quizId ?? "new"}
            open={editorOpen}
            quiz={editingQuiz}
            questionBank={questionBank}
            groupOptions={groups}
            questionBankLoading={questionBankLoading || groupsLoading}
            submitting={submitting}
            title={
              editingQuiz
                ? t("quizzes.dialogs.editTitle")
                : t("quizzes.dialogs.createTitle")
            }
            description={t("quizzes.dialogs.description")}
            cancelLabel={t("common.cancel")}
            saveLabel={editingQuiz ? t("common.save") : t("common.create")}
            searchPlaceholder={t("quizzes.dialogs.questionSearchPlaceholder")}
            unsupportedTypeLabel={t("quizzes.dialogs.unsupportedTypeLabel")}
            questionsSectionTitle={t("quizzes.dialogs.questionsSectionTitle")}
            questionPointsLabel={t("quizzes.dialogs.questionPointsLabel")}
            noQuestionsLabel={t("quizzes.dialogs.noQuestionsLabel")}
            validationMessage={t("quizzes.dialogs.validationMessage")}
            fields={{
              title: t("quizzes.fields.title"),
              description: t("quizzes.fields.description"),
              accessCode: t("quizzes.fields.accessCode"),
              attemptsAllowed: t("quizzes.fields.attemptsAllowed"),
              startAt: t("quizzes.fields.startAt"),
              endAt: t("quizzes.fields.endAt"),
              timeLimitMinutes: t("quizzes.fields.timeLimitMinutes"),
              shuffleQuestions: t("quizzes.fields.shuffleQuestions"),
              revealAnswersAfterClose: t(
                "quizzes.fields.revealAnswersAfterClose",
              ),
              assignedGroups: t("quizzes.fields.assignedGroups"),
              assignedGroupsHelper: t("quizzes.fields.assignedGroupsHelper"),
              accessCodeOptional: t("quizzes.fields.accessCodeOptional"),
              accessCodeHelp: t("quizzes.fields.accessCodeHelp"),
              accessCodeAuto: t("quizzes.fields.accessCodeAuto"),
              selectedQuestionsFirst: t(
                "quizzes.dialogs.selectedQuestionsFirst",
              ),
              selectedQuestionsCount: t(
                "quizzes.dialogs.selectedQuestionsCount",
              ),
              questionPaginationLabel: t(
                "quizzes.dialogs.questionPaginationLabel",
              ),
              startAtHelper: t("quizzes.fields.startAtHelper"),
              endAtHelper: t("quizzes.fields.endAtHelper"),
              invalidDateRange: t("quizzes.fields.invalidDateRange"),
              invalidEndDateInPast: t("quizzes.fields.invalidEndDateInPast"),
              parametricQuantity: t("quizzes.fields.parametricQuantity"),
              parametricToleranceOverride: t(
                "quizzes.fields.parametricToleranceOverride",
              ),
              parametricQuantityHelper: t(
                "quizzes.fields.parametricQuantityHelper",
              ),
              parametricToleranceOverrideHelper: t(
                "quizzes.fields.parametricToleranceOverrideHelper",
              ),
            }}
            onClose={closeEditor}
            onSubmit={submitEditor}
          />
        ) : null}
      </Stack>
    </Box>
  );
}
