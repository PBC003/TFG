import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import RemoveCircleOutlineRoundedIcon from "@mui/icons-material/RemoveCircleOutlineRounded";
import {
  Button,
  Checkbox,
  Chip,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
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

type QuizEditorQuestionBankQuestionCardProps = {
  question: QuestionItem;
  selectedQuestion: SelectedQuestionState | undefined;
  submitting: boolean;
  questionPointsLabel: string;
  cancelLabel: string;
  saveLabel: string;
  fields: QuizEditorDialogProps["fields"];
  onToggleQuestion: (question: QuestionItem) => void;
  onUpdateQuestionPoints: (questionId: string, value: string) => void;
  onUpdateQuestionQuantity: (questionId: string, value: string) => void;
  onUpdateQuestionToleranceOverride: (
    questionId: string,
    value: string,
  ) => void;
};

export function QuizEditorQuestionBankQuestionCard({
  question,
  selectedQuestion,
  submitting,
  questionPointsLabel,
  cancelLabel,
  saveLabel,
  fields,
  onToggleQuestion,
  onUpdateQuestionPoints,
  onUpdateQuestionQuantity,
  onUpdateQuestionToleranceOverride,
}: QuizEditorQuestionBankQuestionCardProps) {
  const isSelected = Boolean(selectedQuestion);
  const isParametric = question.type === "parametric";
  const maxVariants = isParametric
    ? getParametricTemplateVariantCount(
        (question.questionConfig as ParametricQuestionConfig).templateId,
      )
    : null;

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
      <Stack spacing={1.5}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          spacing={1.5}
        >
          <Stack spacing={0.75}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Checkbox
                checked={isSelected}
                onChange={() => onToggleQuestion(question)}
                disabled={submitting}
              />
              <Typography variant="subtitle1" fontWeight={700}>
                {question.title}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip size="small" label={question.type} color="default" />
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
                    label={fields.parametricQuantity ?? "Cantidad"}
                    value={selectedQuestion?.quantity ?? 1}
                    onChange={(event) =>
                      onUpdateQuestionQuantity(
                        question.questionId,
                        event.target.value,
                      )
                    }
                    disabled={submitting}
                    type="number"
                    inputProps={{ min: 1, max: maxVariants ?? undefined }}
                    helperText={(
                      fields.parametricQuantityHelper ??
                      "Máximo disponible: {{max}}."
                    ).replace("{{max}}", String(maxVariants ?? 1))}
                    sx={{ width: { xs: "100%", md: 160 } }}
                  />
                  <TextField
                    label={fields.parametricToleranceOverride ?? "Tolerancia"}
                    value={selectedQuestion?.toleranceOverride ?? ""}
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
                    helperText={fields.parametricToleranceOverrideHelper ?? ""}
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
  );
}
