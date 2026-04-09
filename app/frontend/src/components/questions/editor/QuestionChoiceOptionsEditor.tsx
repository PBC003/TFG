import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import {
  Box,
  Button,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { QuestionMathField } from "./QuestionMathField";
import type { EditableOption } from "./question-editor.types";

type QuestionChoiceOptionsEditorProps = {
  deleteLabel: string;
  options: EditableOption[];
  correctLabel: string;
  optionTextLabel: string;
  optionFeedbackLabel: string;
  optionLabel: (index: number) => string;
  addOptionLabel: string;
  latexFieldHelper: string;
  canSelectMultipleCorrect: boolean;
  onToggleCorrect: (index: number, checked: boolean) => void;
  onChangeOptionField: (
    index: number,
    field: "text" | "feedback",
    value: string,
  ) => void;
  onRemoveOption: (index: number) => void;
  onAddOption: () => void;
  isOptionPreview: (fieldKey: string) => boolean;
  onTogglePreview: (fieldKey: string) => void;
};

export function QuestionChoiceOptionsEditor({
  options,
  deleteLabel,
  correctLabel,
  optionTextLabel,
  optionFeedbackLabel,
  optionLabel,
  addOptionLabel,
  latexFieldHelper,
  canSelectMultipleCorrect,
  onToggleCorrect,
  onChangeOptionField,
  onRemoveOption,
  onAddOption,
  isOptionPreview,
  onTogglePreview,
}: QuestionChoiceOptionsEditorProps) {
  return (
    <Stack spacing={2}>
      <Stack spacing={1.5}>
        {options.map((option, index) => (
          <Paper
            key={`option-${option.key}-${index}`}
            variant="outlined"
            sx={{ p: 2 }}
          >
            <Stack spacing={1.5}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography fontWeight={700}>{optionLabel(index)}</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={option.isCorrect}
                        onChange={(event) =>
                          onToggleCorrect(
                            index,
                            canSelectMultipleCorrect
                              ? event.target.checked
                              : true,
                          )
                        }
                      />
                    }
                    label={correctLabel}
                  />
                  <IconButton
                    aria-label={deleteLabel}
                    onClick={() => onRemoveOption(index)}
                    disabled={options.length <= 2}
                  >
                    <DeleteOutlineRoundedIcon />
                  </IconButton>
                </Stack>
              </Stack>

              <QuestionMathField
                fieldKey={`optionText.${index}`}
                label={optionTextLabel}
                value={option.text}
                isPreview={isOptionPreview(`optionText.${index}`)}
                onTogglePreview={onTogglePreview}
                onChange={(nextValue) =>
                  onChangeOptionField(index, "text", nextValue)
                }
                minRows={2}
                helperText={latexFieldHelper}
              />

              <QuestionMathField
                fieldKey={`optionFeedback.${index}`}
                label={optionFeedbackLabel}
                value={option.feedback}
                isPreview={isOptionPreview(`optionFeedback.${index}`)}
                onTogglePreview={onTogglePreview}
                onChange={(nextValue) =>
                  onChangeOptionField(index, "feedback", nextValue)
                }
                minRows={2}
                helperText={latexFieldHelper}
              />
            </Stack>
          </Paper>
        ))}
      </Stack>

      <Box>
        <Button startIcon={<AddRoundedIcon />} onClick={onAddOption}>
          {addOptionLabel}
        </Button>
      </Box>
    </Stack>
  );
}
