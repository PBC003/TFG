import { Paper, Typography } from "@mui/material";
import { QuestionsMobileList } from "../../../components/questions/list/QuestionsMobileList";
import { QuestionsTableView } from "../../../components/questions/list/QuestionsTableView";
import type { QuestionsPageContentProps } from "../types/questions-page.types";

export function QuestionsPageContent({
  loading,
  isMobile,
  questions,
  locale,
  noneLabel,
  loadingLabel,
  emptyLabel,
  editLabel,
  deleteLabel,
  tableHeaders,
  lastUpdatedLabel,
  onEdit,
  onDelete,
}: QuestionsPageContentProps) {
  if (loading) {
    return (
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography color="text.secondary">{loadingLabel}</Typography>
      </Paper>
    );
  }

  if (questions.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography color="text.secondary">{emptyLabel}</Typography>
      </Paper>
    );
  }

  if (isMobile) {
    return (
      <QuestionsMobileList
        questions={questions}
        locale={locale}
        noneLabel={noneLabel}
        lastUpdatedLabel={lastUpdatedLabel}
        editLabel={editLabel}
        deleteLabel={deleteLabel}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );
  }

  return (
    <QuestionsTableView
      questions={questions}
      locale={locale}
      headers={tableHeaders}
      noneLabel={noneLabel}
      editLabel={editLabel}
      deleteLabel={deleteLabel}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}
