import {
  Alert,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { QuestionChoiceOptionsEditor } from "./QuestionChoiceOptionsEditor";
import { QuestionTrueFalseEditor } from "./QuestionTrueFalseEditor";
import type { EditableOption, FormState } from "./question-editor.types";

type QuestionTypeSpecificConfigProps = {
  form: FormState;
  latexFieldHelper: string;
  isPreview: (fieldKey: string) => boolean;
  onTogglePreview: (fieldKey: string) => void;
  onUpdateForm: (updater: (current: FormState) => FormState) => void;
  onUpdateSingleChoiceOption: (
    index: number,
    field: keyof EditableOption,
    value: string | boolean,
  ) => void;
  onUpdateMultipleChoiceOption: (
    index: number,
    field: keyof EditableOption,
    value: string | boolean,
  ) => void;
  onAddSingleChoiceOption: () => void;
  onAddMultipleChoiceOption: () => void;
  onRemoveSingleChoiceOption: (index: number) => void;
  onRemoveMultipleChoiceOption: (index: number) => void;
};

export function QuestionTypeSpecificConfig({
  form,
  latexFieldHelper,
  isPreview,
  onTogglePreview,
  onUpdateForm,
  onUpdateSingleChoiceOption,
  onUpdateMultipleChoiceOption,
  onAddSingleChoiceOption,
  onAddMultipleChoiceOption,
  onRemoveSingleChoiceOption,
  onRemoveMultipleChoiceOption,
}: QuestionTypeSpecificConfigProps) {
  const { t } = useTranslation();

  return (
    <Stack spacing={1.5}>
      <Typography variant="h6">
        {t("questions.fields.typeSpecificConfig")}
      </Typography>

      {form.type === "true_false" ? (
        <QuestionTrueFalseEditor
          correctAnswer={form.trueFalse.correctAnswer}
          feedbackForTrue={form.trueFalse.feedbackForTrue}
          feedbackForFalse={form.trueFalse.feedbackForFalse}
          onCorrectAnswerChange={(nextValue) =>
            onUpdateForm((current) => ({
              ...current,
              trueFalse: {
                ...current.trueFalse,
                correctAnswer: nextValue,
              },
            }))
          }
          onFeedbackForTrueChange={(nextValue) =>
            onUpdateForm((current) => ({
              ...current,
              trueFalse: {
                ...current.trueFalse,
                feedbackForTrue: nextValue,
              },
            }))
          }
          onFeedbackForFalseChange={(nextValue) =>
            onUpdateForm((current) => ({
              ...current,
              trueFalse: {
                ...current.trueFalse,
                feedbackForFalse: nextValue,
              },
            }))
          }
          answerLabel={t("questions.fields.correctAnswer")}
          trueLabel={t("questions.answers.true")}
          falseLabel={t("questions.answers.false")}
          optionFeedbackLabel={t("questions.fields.optionFeedback")}
          latexFieldHelper={latexFieldHelper}
          isPreview={isPreview}
          onTogglePreview={onTogglePreview}
        />
      ) : null}

      {form.type === "single_choice" ? (
        <Stack spacing={2}>
          <FormControlLabel
            control={
              <Switch
                checked={form.singleChoice.randomizeOptions}
                onChange={(event) =>
                  onUpdateForm((current) => ({
                    ...current,
                    singleChoice: {
                      ...current.singleChoice,
                      randomizeOptions: event.target.checked,
                    },
                  }))
                }
              />
            }
            label={t("questions.fields.randomizeOptions")}
          />

          <QuestionChoiceOptionsEditor
            deleteLabel={t("common.delete")}
            options={form.singleChoice.options}
            correctLabel={t("questions.fields.correctOption")}
            optionTextLabel={t("questions.fields.optionText")}
            optionFeedbackLabel={t("questions.fields.optionFeedback")}
            optionLabel={(index) =>
              t("questions.fields.optionLabel", { index: index + 1 })
            }
            addOptionLabel={t("questions.actions.addOption")}
            latexFieldHelper={latexFieldHelper}
            canSelectMultipleCorrect={false}
            onToggleCorrect={(index) =>
              onUpdateSingleChoiceOption(index, "isCorrect", true)
            }
            onChangeOptionField={(index, field, value) =>
              onUpdateSingleChoiceOption(index, field, value)
            }
            onRemoveOption={onRemoveSingleChoiceOption}
            onAddOption={onAddSingleChoiceOption}
            isOptionPreview={(fieldKey) =>
              isPreview(`singleChoice.${fieldKey}`)
            }
            onTogglePreview={(fieldKey) =>
              onTogglePreview(`singleChoice.${fieldKey}`)
            }
          />
        </Stack>
      ) : null}

      {form.type === "multiple_choice" ? (
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.multipleChoice.randomizeOptions}
                  onChange={(event) =>
                    onUpdateForm((current) => ({
                      ...current,
                      multipleChoice: {
                        ...current.multipleChoice,
                        randomizeOptions: event.target.checked,
                      },
                    }))
                  }
                />
              }
              label={t("questions.fields.randomizeOptions")}
            />

            <TextField
              select
              label={t("questions.fields.gradingMode")}
              value={form.multipleChoice.gradingMode}
              onChange={(event) =>
                onUpdateForm((current) => ({
                  ...current,
                  multipleChoice: {
                    ...current.multipleChoice,
                    gradingMode: event.target.value as
                      | "all_or_nothing"
                      | "partial_credit",
                  },
                }))
              }
              sx={{ minWidth: { xs: "100%", md: 260 } }}
            >
              <MenuItem value="all_or_nothing">
                {t("questions.gradingModes.all_or_nothing")}
              </MenuItem>
              <MenuItem value="partial_credit">
                {t("questions.gradingModes.partial_credit")}
              </MenuItem>
            </TextField>
          </Stack>

          <QuestionChoiceOptionsEditor
            deleteLabel={t("common.delete")}
            options={form.multipleChoice.options}
            correctLabel={t("questions.fields.optionIsCorrect")}
            optionTextLabel={t("questions.fields.optionText")}
            optionFeedbackLabel={t("questions.fields.optionFeedback")}
            optionLabel={(index) =>
              t("questions.fields.optionLabel", { index: index + 1 })
            }
            addOptionLabel={t("questions.actions.addOption")}
            latexFieldHelper={latexFieldHelper}
            canSelectMultipleCorrect
            onToggleCorrect={(index, checked) =>
              onUpdateMultipleChoiceOption(index, "isCorrect", checked)
            }
            onChangeOptionField={(index, field, value) =>
              onUpdateMultipleChoiceOption(index, field, value)
            }
            onRemoveOption={onRemoveMultipleChoiceOption}
            onAddOption={onAddMultipleChoiceOption}
            isOptionPreview={(fieldKey) =>
              isPreview(`multipleChoice.${fieldKey}`)
            }
            onTogglePreview={(fieldKey) =>
              onTogglePreview(`multipleChoice.${fieldKey}`)
            }
          />
        </Stack>
      ) : null}

      {form.type === "parametric" ? (
        <Alert severity="warning">
          {t("questions.dialogs.parametricUnavailable")}
        </Alert>
      ) : null}
    </Stack>
  );
}
