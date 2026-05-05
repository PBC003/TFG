import {
  List,
  ListItem,
  Paper,
  Stack,
  TablePagination,
  Typography,
} from "@mui/material";
import { memo } from "react";
import type { QuestionItem } from "../../../../types/question";
import type {
  QuizEditorDialogProps,
  SelectedQuestionState,
} from "./quiz-editor-dialog.types";
import { QUESTION_ROWS_PER_PAGE_OPTIONS } from "../../utils/quiz-editor-dialog.utils";
import { countSelectedQuizQuestionSlots } from "../../utils/quiz-editor-selection.utils";
import { QuizEditorQuestionBankHeader } from "./QuizEditorQuestionBankHeader";
import { QuizEditorQuestionBankQuestionCard } from "./QuizEditorQuestionBankQuestionCard";

type QuizEditorQuestionBankSectionProps = {
  submitting: boolean;
  loading: boolean;
  searchPlaceholder: string;
  unsupportedTypeLabel: string;
  questionsSectionTitle: string;
  questionPointsLabel: string;
  noQuestionsLabel: string;
  loadingLabel: string;
  cancelLabel: string;
  saveLabel: string;
  fields: QuizEditorDialogProps["fields"];
  search: string;
  selectedQuestions: SelectedQuestionState[];
  selectedQuestionMap: Map<string, SelectedQuestionState>;
  orderedQuestions: QuestionItem[];
  pagedQuestions: QuestionItem[];
  questionPage: number;
  questionRowsPerPage: number;
  onSearchChange: (value: string) => void;
  onQuestionPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onToggleQuestion: (question: QuestionItem) => void;
  onUpdateQuestionPoints: (questionId: string, value: string) => void;
  onUpdateQuestionQuantity: (questionId: string, value: string) => void;
  onUpdateQuestionToleranceOverride: (
    questionId: string,
    value: string,
  ) => void;
};

export const QuizEditorQuestionBankSection = memo(
  function QuizEditorQuestionBankSection({
    submitting,
    loading,
    searchPlaceholder,
    questionsSectionTitle,
    questionPointsLabel,
    noQuestionsLabel,
    loadingLabel,
    cancelLabel,
    saveLabel,
    fields,
    search,
    selectedQuestions,
    selectedQuestionMap,
    orderedQuestions,
    pagedQuestions,
    questionPage,
    questionRowsPerPage,
    onSearchChange,
    onQuestionPageChange,
    onRowsPerPageChange,
    onToggleQuestion,
    onUpdateQuestionPoints,
    onUpdateQuestionQuantity,
    onUpdateQuestionToleranceOverride,
  }: QuizEditorQuestionBankSectionProps) {
    const totalSelectedSlots =
      countSelectedQuizQuestionSlots(selectedQuestions);

    return (
      <Stack spacing={1.5}>
        <QuizEditorQuestionBankHeader
          questionsSectionTitle={questionsSectionTitle}
          fields={fields}
          totalSelectedSlots={totalSelectedSlots}
          searchPlaceholder={searchPlaceholder}
          search={search}
          submitting={submitting}
          loading={loading}
          onSearchChange={onSearchChange}
        />

        {loading ? (
          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <Typography color="text.secondary">{loadingLabel}</Typography>
          </Paper>
        ) : orderedQuestions.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <Typography color="text.secondary">{noQuestionsLabel}</Typography>
          </Paper>
        ) : (
          <>
            <List disablePadding sx={{ display: "grid", gap: 1.5 }}>
              {pagedQuestions.map((question) => (
                <ListItem
                  key={question.questionId}
                  disableGutters
                  sx={{ display: "block" }}
                >
                  <QuizEditorQuestionBankQuestionCard
                    question={question}
                    selectedQuestion={selectedQuestionMap.get(
                      question.questionId,
                    )}
                    submitting={submitting}
                    questionPointsLabel={questionPointsLabel}
                    cancelLabel={cancelLabel}
                    saveLabel={saveLabel}
                    fields={fields}
                    onToggleQuestion={onToggleQuestion}
                    onUpdateQuestionPoints={onUpdateQuestionPoints}
                    onUpdateQuestionQuantity={onUpdateQuestionQuantity}
                    onUpdateQuestionToleranceOverride={
                      onUpdateQuestionToleranceOverride
                    }
                  />
                </ListItem>
              ))}
            </List>

            <TablePagination
              component="div"
              count={orderedQuestions.length}
              page={questionPage}
              onPageChange={(_, nextPage) => onQuestionPageChange(nextPage)}
              rowsPerPage={questionRowsPerPage}
              onRowsPerPageChange={(event) =>
                onRowsPerPageChange(Number.parseInt(event.target.value, 10))
              }
              rowsPerPageOptions={QUESTION_ROWS_PER_PAGE_OPTIONS}
              labelRowsPerPage={fields.questionPaginationLabel}
            />
          </>
        )}
      </Stack>
    );
  },
);
