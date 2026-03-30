import { useTranslation } from "react-i18next";
import { QuestionTrueFalseEditor } from "../editor/QuestionTrueFalseEditor";
import type {
  QuestionPreviewControlProps,
  QuestionTypeSpecificFormUpdateProps,
} from "./question-type-specific-config.types";

type QuestionTrueFalseConfigSectionProps = QuestionTypeSpecificFormUpdateProps &
  QuestionPreviewControlProps;

export function QuestionTrueFalseConfigSection({
  form,
  latexFieldHelper,
  isPreview,
  onTogglePreview,
  onUpdateForm,
}: QuestionTrueFalseConfigSectionProps) {
  const { t } = useTranslation();

  return (
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
  );
}
