import type { EditableOption, FormState } from "./question-editor.types";

export type QuestionTypeSpecificConfigProps = {
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

export type QuestionPreviewControlProps = Pick<
  QuestionTypeSpecificConfigProps,
  "latexFieldHelper" | "isPreview" | "onTogglePreview"
>;

export type QuestionTypeSpecificFormUpdateProps = Pick<
  QuestionTypeSpecificConfigProps,
  "form" | "onUpdateForm"
>;
