import type {
  EditableOption,
  FormState,
} from "../editor/question-editor.types";

export type QuestionTypeSpecificConfigBaseProps = {
  form: FormState;
  latexFieldHelper: string;
  isPreview: (fieldKey: string) => boolean;
  onTogglePreview: (fieldKey: string) => void;
  onUpdateForm: (updater: (current: FormState) => FormState) => void;
};

export type QuestionSingleChoiceConfigSectionProps =
  QuestionTypeSpecificConfigBaseProps & {
    onUpdateSingleChoiceOption: (
      index: number,
      field: keyof EditableOption,
      value: string | boolean,
    ) => void;
    onAddSingleChoiceOption: () => void;
    onRemoveSingleChoiceOption: (index: number) => void;
  };

export type QuestionMultipleChoiceConfigSectionProps =
  QuestionTypeSpecificConfigBaseProps & {
    onUpdateMultipleChoiceOption: (
      index: number,
      field: keyof EditableOption,
      value: string | boolean,
    ) => void;
    onAddMultipleChoiceOption: () => void;
    onRemoveMultipleChoiceOption: (index: number) => void;
  };

export type QuestionPreviewControlProps = Pick<
  QuestionTypeSpecificConfigBaseProps,
  "latexFieldHelper" | "isPreview" | "onTogglePreview"
>;
export type QuestionTypeSpecificFormUpdateProps = Pick<
  QuestionTypeSpecificConfigBaseProps,
  "form" | "onUpdateForm"
>;
