import { MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { QuestionMathField } from "./QuestionMathField";

type QuestionTrueFalseEditorProps = {
  correctAnswer: boolean;
  feedbackForTrue: string;
  feedbackForFalse: string;
  onCorrectAnswerChange: (nextValue: boolean) => void;
  onFeedbackForTrueChange: (nextValue: string) => void;
  onFeedbackForFalseChange: (nextValue: string) => void;
  answerLabel: string;
  trueLabel: string;
  falseLabel: string;
  optionFeedbackLabel: string;
  latexFieldHelper: string;
  isPreview: (fieldKey: string) => boolean;
  onTogglePreview: (fieldKey: string) => void;
};

export function QuestionTrueFalseEditor({
  correctAnswer,
  feedbackForTrue,
  feedbackForFalse,
  onCorrectAnswerChange,
  onFeedbackForTrueChange,
  onFeedbackForFalseChange,
  answerLabel,
  trueLabel,
  falseLabel,
  optionFeedbackLabel,
  latexFieldHelper,
  isPreview,
  onTogglePreview,
}: QuestionTrueFalseEditorProps) {
  return (
    <Stack spacing={2}>
      <TextField
        select
        label={answerLabel}
        value={String(correctAnswer)}
        onChange={(event) =>
          onCorrectAnswerChange(event.target.value === "true")
        }
        fullWidth
      >
        <MenuItem value="true">{trueLabel}</MenuItem>
        <MenuItem value="false">{falseLabel}</MenuItem>
      </TextField>

      <Stack spacing={1.5}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={1.5}>
            <Typography fontWeight={700}>{trueLabel}</Typography>
            <QuestionMathField
              fieldKey="feedbackForTrue"
              label={optionFeedbackLabel}
              value={feedbackForTrue}
              isPreview={isPreview("feedbackForTrue")}
              onTogglePreview={onTogglePreview}
              onChange={onFeedbackForTrueChange}
              minRows={2}
              helperText={latexFieldHelper}
            />
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={1.5}>
            <Typography fontWeight={700}>{falseLabel}</Typography>
            <QuestionMathField
              fieldKey="feedbackForFalse"
              label={optionFeedbackLabel}
              value={feedbackForFalse}
              isPreview={isPreview("feedbackForFalse")}
              onTogglePreview={onTogglePreview}
              onChange={onFeedbackForFalseChange}
              minRows={2}
              helperText={latexFieldHelper}
            />
          </Stack>
        </Paper>
      </Stack>
    </Stack>
  );
}
