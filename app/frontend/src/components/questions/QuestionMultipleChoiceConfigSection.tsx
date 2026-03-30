import {
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { QuestionChoiceOptionsEditor } from "./QuestionChoiceOptionsEditor";
import type {
  QuestionPreviewControlProps,
  QuestionTypeSpecificConfigProps,
} from "./question-type-specific-config.types";

type QuestionMultipleChoiceConfigSectionProps = Pick<
  QuestionTypeSpecificConfigProps,
  | "form"
  | "onUpdateForm"
  | "onUpdateMultipleChoiceOption"
  | "onAddMultipleChoiceOption"
  | "onRemoveMultipleChoiceOption"
> &
  QuestionPreviewControlProps;

export function QuestionMultipleChoiceConfigSection({
  form,
  latexFieldHelper,
  isPreview,
  onTogglePreview,
  onUpdateForm,
  onUpdateMultipleChoiceOption,
  onAddMultipleChoiceOption,
  onRemoveMultipleChoiceOption,
}: QuestionMultipleChoiceConfigSectionProps) {
  const { t } = useTranslation();

  return (
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
        isOptionPreview={(fieldKey) => isPreview(`multipleChoice.${fieldKey}`)}
        onTogglePreview={(fieldKey) =>
          onTogglePreview(`multipleChoice.${fieldKey}`)
        }
      />
    </Stack>
  );
}
