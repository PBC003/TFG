import { Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { buildCanonicalParametricStatement } from "../../../utils/parametric-question.utils";
import { QuestionTrueFalseEditor } from "../editor/QuestionTrueFalseEditor";
import type {
  EditableOption,
  FormState,
} from "../editor/question-editor.types";
import { QuestionMultipleChoiceConfigSection } from "./QuestionMultipleChoiceConfigSection";
import { QuestionParametricConfigSection } from "./QuestionParametricConfigSection";
import { QuestionSingleChoiceConfigSection } from "./QuestionSingleChoiceConfigSection";

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
        <QuestionSingleChoiceConfigSection
          form={form}
          latexFieldHelper={latexFieldHelper}
          isPreview={isPreview}
          onTogglePreview={onTogglePreview}
          onUpdateForm={onUpdateForm}
          onUpdateSingleChoiceOption={onUpdateSingleChoiceOption}
          onAddSingleChoiceOption={onAddSingleChoiceOption}
          onRemoveSingleChoiceOption={onRemoveSingleChoiceOption}
        />
      ) : null}

      {form.type === "multiple_choice" ? (
        <QuestionMultipleChoiceConfigSection
          form={form}
          latexFieldHelper={latexFieldHelper}
          isPreview={isPreview}
          onTogglePreview={onTogglePreview}
          onUpdateForm={onUpdateForm}
          onUpdateMultipleChoiceOption={onUpdateMultipleChoiceOption}
          onAddMultipleChoiceOption={onAddMultipleChoiceOption}
          onRemoveMultipleChoiceOption={onRemoveMultipleChoiceOption}
        />
      ) : null}

      {form.type === "parametric" ? (
        <QuestionParametricConfigSection
          form={form}
          onTemplateChange={(templateId) =>
            onUpdateForm((current) => ({
              ...current,
              statement: buildCanonicalParametricStatement(templateId),
              parametric: {
                ...current.parametric,
                templateId,
                sampleSeed: Date.now(),
              },
            }))
          }
          onRegenerateSample={() =>
            onUpdateForm((current) => ({
              ...current,
              parametric: {
                ...current.parametric,
                sampleSeed: Date.now(),
              },
            }))
          }
        />
      ) : null}
    </Stack>
  );
}
