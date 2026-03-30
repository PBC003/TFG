import { useState } from "react";
import type { TFunction } from "i18next";
import type {
  CreateQuestionInput,
  QuestionItem,
  UpdateQuestionInput,
} from "../../../types/question";
import type {
  EditableOption,
  FormState,
  PreviewState,
} from "./question-editor.types";
import {
  buildInitialState,
  buildQuestionConfig,
  createEmptyOption,
  ensureAtLeastOneCorrectOption,
  normalizeTags,
  validateForm,
} from "./question-editor.utils";

type UseQuestionEditorDialogParams = {
  question: QuestionItem | null;
  onSubmit: (
    payload: CreateQuestionInput | UpdateQuestionInput,
  ) => Promise<void>;
  t: TFunction;
};

export function useQuestionEditorDialog({
  question,
  onSubmit,
  t,
}: UseQuestionEditorDialogParams) {
  const [form, setForm] = useState<FormState>(() =>
    buildInitialState(question),
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [previewFields, setPreviewFields] = useState<PreviewState>({});

  const updateForm = (updater: (current: FormState) => FormState) => {
    setForm(updater);
  };

  const togglePreviewField = (fieldKey: string) => {
    setPreviewFields((current) => ({
      ...current,
      [fieldKey]: !current[fieldKey],
    }));
  };

  const updateChoiceOption = (
    scope: "singleChoice" | "multipleChoice",
    index: number,
    field: keyof EditableOption,
    value: string | boolean,
  ) => {
    updateForm((current) => {
      const options = current[scope].options.map((option, optionIndex) => {
        if (optionIndex !== index) {
          return scope === "singleChoice" && field === "isCorrect"
            ? { ...option, isCorrect: false }
            : option;
        }

        return {
          ...option,
          [field]: value,
        };
      });

      return {
        ...current,
        [scope]: {
          ...current[scope],
          options,
        },
      };
    });
  };

  const handleAddTag = () => {
    const nextTag = form.newTag.trim();

    if (!nextTag) {
      return;
    }

    updateForm((current) => ({
      ...current,
      tags: normalizeTags([...current.tags, nextTag]),
      newTag: "",
    }));
  };

  const addChoiceOption = (scope: "singleChoice" | "multipleChoice") => {
    updateForm((current) => ({
      ...current,
      [scope]: {
        ...current[scope],
        options: [
          ...current[scope].options,
          createEmptyOption(current[scope].options.length),
        ],
      },
    }));
  };

  const removeChoiceOption = (
    scope: "singleChoice" | "multipleChoice",
    index: number,
  ) => {
    updateForm((current) => ({
      ...current,
      [scope]: {
        ...current[scope],
        options: ensureAtLeastOneCorrectOption(
          current[scope].options.filter(
            (_, optionIndex) => optionIndex !== index,
          ),
        ),
      },
    }));
  };

  const handleSubmit = async () => {
    const validationError = validateForm(form, t);

    if (validationError) {
      setFormError(validationError);
      return;
    }

    setFormError(null);

    const payload: CreateQuestionInput | UpdateQuestionInput = {
      title: form.title.trim(),
      type: form.type,
      statement: form.statement.trim(),
      explanation: form.explanation.trim() || null,
      tags: normalizeTags(form.tags),
      questionConfig: buildQuestionConfig(form),
    };

    await onSubmit(payload);
  };

  return {
    form,
    formError,
    previewFields,
    updateForm,
    togglePreviewField,
    updateSingleChoiceOption: (
      index: number,
      field: keyof EditableOption,
      value: string | boolean,
    ) => updateChoiceOption("singleChoice", index, field, value),
    updateMultipleChoiceOption: (
      index: number,
      field: keyof EditableOption,
      value: string | boolean,
    ) => updateChoiceOption("multipleChoice", index, field, value),
    handleAddTag,
    addSingleChoiceOption: () => addChoiceOption("singleChoice"),
    addMultipleChoiceOption: () => addChoiceOption("multipleChoice"),
    removeSingleChoiceOption: (index: number) =>
      removeChoiceOption("singleChoice", index),
    removeMultipleChoiceOption: (index: number) =>
      removeChoiceOption("multipleChoice", index),
    handleSubmit,
  };
}
