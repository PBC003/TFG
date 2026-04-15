import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import RemoveCircleOutlineRoundedIcon from "@mui/icons-material/RemoveCircleOutlineRounded";
import {
  Button,
  Checkbox,
  Chip,
  List,
  ListItem,
  Paper,
  Stack,
  TablePagination,
  TextField,
  Typography,
} from "@mui/material";
import { memo } from "react";
import { MathText } from "../../../../components/math/MathText";
import {
  DEFAULT_PARAMETRIC_TOLERANCE,
  getParametricTemplateVariantCount,
} from "../../../../utils/parametric-question.utils";
import type {
  ParametricQuestionConfig,
  QuestionItem,
} from "../../../../types/question";
import type {
  QuizEditorDialogProps,
  SelectedQuestionState,
} from "./quiz-editor-dialog.types";
import { QUESTION_ROWS_PER_PAGE_OPTIONS } from "../../utils/quiz-editor-dialog.utils";
import { countSelectedQuizQuestionSlots } from "../../utils/quiz-editor-selection.utils";

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
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          spacing={1.5}
          alignItems={{ md: "center" }}
        >
          <Stack spacing={0.5}>
            <Typography variant="h6">{questionsSectionTitle}</Typography>
            <Typography variant="body2" color="text.secondary">
              {fields.selectedQuestionsCount.replace(
                "{{count}}",
                String(totalSelectedSlots),
              )}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {fields.selectedQuestionsFirst}
            </Typography>
          </Stack>
          <TextField
            label={searchPlaceholder}
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            disabled={submitting || loading}
            fullWidth
            sx={{ maxWidth: { xs: "100%", md: 360 } }}
          />
        </Stack>

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
              {pagedQuestions.map((question) => {
                const selectedQuestion = selectedQuestionMap.get(
                  question.questionId,
                );
                const isSelected = Boolean(selectedQuestion);
                const isParametric = question.type === "parametric";
                const maxVariants = isParametric
                  ? getParametricTemplateVariantCount(
                      (question.questionConfig as ParametricQuestionConfig)
                        .templateId,
                    )
                  : null;

                return (
                  <ListItem
                    key={question.questionId}
                    disableGutters
                    sx={{ display: "block" }}
                  >
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
                      <Stack spacing={1.5}>
                        <Stack
                          direction={{ xs: "column", md: "row" }}
                          justifyContent="space-between"
                          spacing={1.5}
                        >
                          <Stack spacing={0.75}>
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <Checkbox
                                checked={isSelected}
                                onChange={() => onToggleQuestion(question)}
                                disabled={submitting}
                              />
                              <Typography variant="subtitle1" fontWeight={700}>
                                {question.title}
                              </Typography>
                            </Stack>
                            <Stack
                              direction="row"
                              spacing={1}
                              flexWrap="wrap"
                              useFlexGap
                            >
                              <Chip
                                size="small"
                                label={question.type}
                                color="default"
                              />
                              {question.tags.map((tag) => (
                                <Chip
                                  key={`${question.questionId}-${tag}`}
                                  size="small"
                                  label={tag}
                                />
                              ))}
                            </Stack>
                          </Stack>

                          {isSelected ? (
                            <Stack
                              direction={{ xs: "column", md: "row" }}
                              spacing={1}
                              sx={{ width: { xs: "100%", md: "auto" } }}
                            >
                              <TextField
                                label={questionPointsLabel}
                                value={selectedQuestion?.points ?? 1}
                                onChange={(event) =>
                                  onUpdateQuestionPoints(
                                    question.questionId,
                                    event.target.value,
                                  )
                                }
                                disabled={submitting}
                                type="number"
                                inputProps={{ min: 1 }}
                                sx={{ width: { xs: "100%", md: 140 } }}
                              />

                              {isParametric ? (
                                <>
                                  <TextField
                                    label={
                                      fields.parametricQuantity ?? "Cantidad"
                                    }
                                    value={selectedQuestion?.quantity ?? 1}
                                    onChange={(event) =>
                                      onUpdateQuestionQuantity(
                                        question.questionId,
                                        event.target.value,
                                      )
                                    }
                                    disabled={submitting}
                                    type="number"
                                    inputProps={{
                                      min: 1,
                                      max: maxVariants ?? undefined,
                                    }}
                                    helperText={(
                                      fields.parametricQuantityHelper ??
                                      "Máximo disponible: {{max}}."
                                    ).replace(
                                      "{{max}}",
                                      String(maxVariants ?? 1),
                                    )}
                                    sx={{ width: { xs: "100%", md: 160 } }}
                                  />
                                  <TextField
                                    label={
                                      fields.parametricToleranceOverride ??
                                      "Tolerancia"
                                    }
                                    value={
                                      selectedQuestion?.toleranceOverride ?? ""
                                    }
                                    onChange={(event) =>
                                      onUpdateQuestionToleranceOverride(
                                        question.questionId,
                                        event.target.value,
                                      )
                                    }
                                    onBlur={(event) => {
                                      if (!event.target.value.trim()) {
                                        onUpdateQuestionToleranceOverride(
                                          question.questionId,
                                          String(DEFAULT_PARAMETRIC_TOLERANCE),
                                        );
                                      }
                                    }}
                                    disabled={submitting}
                                    type="text"
                                    inputProps={{ inputMode: "decimal" }}
                                    helperText={
                                      fields.parametricToleranceOverrideHelper ??
                                      ""
                                    }
                                    sx={{ width: { xs: "100%", md: 180 } }}
                                  />
                                </>
                              ) : null}
                            </Stack>
                          ) : null}
                        </Stack>

                        <MathText value={question.statement} emptyText="—" />

                        <Stack direction="row" justifyContent="flex-end">
                          <Button
                            size="small"
                            variant={isSelected ? "outlined" : "contained"}
                            onClick={() => onToggleQuestion(question)}
                            disabled={submitting}
                            startIcon={
                              isSelected ? (
                                <RemoveCircleOutlineRoundedIcon />
                              ) : (
                                <AddCircleOutlineRoundedIcon />
                              )
                            }
                          >
                            {isSelected ? cancelLabel : saveLabel}
                          </Button>
                        </Stack>
                      </Stack>
                    </Paper>
                  </ListItem>
                );
              })}
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
