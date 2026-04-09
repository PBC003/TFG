import { Paper, TablePagination, Typography } from "@mui/material";
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
  page,
  rowsPerPage,
  totalQuestions,
  rowsPerPageLabel,
  displayedRowsLabel,
  onPageChange,
  onRowsPerPageChange,
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

  if (totalQuestions === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography color="text.secondary">{emptyLabel}</Typography>
      </Paper>
    );
  }

  return (
    <Paper variant="outlined" sx={{ overflow: "hidden" }}>
      {isMobile ? (
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
      ) : (
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
      )}

      <TablePagination
        component="div"
        count={totalQuestions}
        page={page}
        onPageChange={(_, nextPage) => onPageChange(nextPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(event) =>
          onRowsPerPageChange(Number.parseInt(event.target.value, 10))
        }
        rowsPerPageOptions={[5, 10, 25]}
        labelRowsPerPage={rowsPerPageLabel}
        labelDisplayedRows={({ from, to, count }) =>
          displayedRowsLabel(from, to, count)
        }
        sx={{
          borderTop: 1,
          borderColor: "divider",
          "& .MuiTablePagination-toolbar": {
            flexWrap: "wrap",
            rowGap: 1,
            px: { xs: 1.5, sm: 2 },
          },
          "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
            {
              mb: { xs: 0.5, sm: 0 },
            },
        }}
      />
    </Paper>
  );
}
