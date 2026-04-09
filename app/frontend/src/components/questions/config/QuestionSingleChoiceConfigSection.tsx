import { FormControlLabel, Stack, Switch } from "@mui/material";
import { useTranslation } from "react-i18next";
import { QuestionChoiceOptionsEditor } from "../editor/QuestionChoiceOptionsEditor";
import type {
  QuestionPreviewControlProps,
  QuestionTypeSpecificConfigProps,
} from "./question-type-specific-config.types";

type QuestionSingleChoiceConfigSectionProps = Pick<
  QuestionTypeSpecificConfigProps,
  | "form"
  | "onUpdateForm"
  | "onUpdateSingleChoiceOption"
  | "onAddSingleChoiceOption"
  | "onRemoveSingleChoiceOption"
> &
  QuestionPreviewControlProps;

export function QuestionSingleChoiceConfigSection({
  form,
  latexFieldHelper,
  isPreview,
  onTogglePreview,
  onUpdateForm,
  onUpdateSingleChoiceOption,
  onAddSingleChoiceOption,
  onRemoveSingleChoiceOption,
}: QuestionSingleChoiceConfigSectionProps) {
  const { t } = useTranslation();

  return (
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
        isOptionPreview={(fieldKey) => isPreview(`singleChoice.${fieldKey}`)}
        onTogglePreview={(fieldKey) =>
          onTogglePreview(`singleChoice.${fieldKey}`)
        }
      />
    </Stack>
  );
}
