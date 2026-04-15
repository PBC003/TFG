import type { TFunction } from "i18next";
import type {
  MultipleChoiceQuestionConfig,
  ParametricQuestionConfig,
  QuestionItem,
  QuestionOption,
  QuestionType,
  QuestionTypeConfig,
  SingleChoiceQuestionConfig,
  TrueFalseQuestionConfig,
} from "../../../types/question";
import {
  buildCanonicalParametricStatement,
  PARAMETRIC_TEMPLATE_IDS,
} from "../../../utils/parametric-question.utils";
import type { EditableOption, FormState } from "./question-editor.types";

export const QUESTION_TYPES: QuestionType[] = [
  "true_false",
  "single_choice",
  "multiple_choice",
  "parametric",
];

export function buildOptionKey(index: number): string {
  return String.fromCharCode(97 + index);
}

export function createEmptyOption(
  index: number,
  isCorrect = false,
): EditableOption {
  return {
    key: buildOptionKey(index),
    text: "",
    feedback: "",
    isCorrect,
  };
}

function normalizeOptionList(
  options: QuestionOption[] | undefined,
  correctKeys: string[],
): EditableOption[] {
  const source =
    options && options.length >= 2
      ? options
      : [createEmptyOption(0, true), createEmptyOption(1, false)];

  const correctKeySet = new Set(correctKeys);

  const normalized = source.map((option, index) => ({
    key: option.key?.trim() || buildOptionKey(index),
    text: option.text ?? "",
    feedback: option.feedback ?? "",
    isCorrect: correctKeySet.has(option.key),
  }));

  if (!normalized.some((option) => option.isCorrect) && normalized.length > 0) {
    normalized[0] = { ...normalized[0], isCorrect: true };
  }

  return normalized;
}

function buildDefaultParametricState(): FormState["parametric"] {
  return {
    templateId: PARAMETRIC_TEMPLATE_IDS[0],
    sampleSeed: Date.now(),
  };
}

export function buildInitialState(question: QuestionItem | null): FormState {
  if (!question) {
    const defaultParametric = buildDefaultParametricState();

    return {
      title: "",
      type: "true_false",
      statement: "",
      explanation: "",
      tags: [],
      newTag: "",
      trueFalse: {
        correctAnswer: true,
        feedbackForTrue: "",
        feedbackForFalse: "",
      },
      singleChoice: {
        options: [createEmptyOption(0, true), createEmptyOption(1, false)],
        randomizeOptions: false,
      },
      multipleChoice: {
        options: [createEmptyOption(0, true), createEmptyOption(1, false)],
        randomizeOptions: false,
        gradingMode: "all_or_nothing",
      },
      parametric: defaultParametric,
    };
  }

  const trueFalseConfig =
    question.questionConfig as Partial<TrueFalseQuestionConfig>;
  const singleChoiceConfig =
    question.questionConfig as Partial<SingleChoiceQuestionConfig>;
  const multipleChoiceConfig =
    question.questionConfig as Partial<MultipleChoiceQuestionConfig>;
  const parametricConfig =
    question.questionConfig as Partial<ParametricQuestionConfig>;
  const defaultParametric = buildDefaultParametricState();
  const resolvedParametric = {
    templateId: parametricConfig.templateId ?? defaultParametric.templateId,
    sampleSeed: Date.now(),
  };

  return {
    title: question.title,
    type: question.type,
    statement:
      question.type === "parametric"
        ? buildCanonicalParametricStatement(resolvedParametric.templateId)
        : question.statement,
    explanation: question.explanation ?? "",
    tags: question.tags,
    newTag: "",
    trueFalse: {
      correctAnswer: trueFalseConfig.correctAnswer ?? true,
      feedbackForTrue: trueFalseConfig.feedbackForTrue ?? "",
      feedbackForFalse: trueFalseConfig.feedbackForFalse ?? "",
    },
    singleChoice: {
      options: normalizeOptionList(
        singleChoiceConfig.options,
        singleChoiceConfig.correctOptionKey
          ? [singleChoiceConfig.correctOptionKey]
          : [],
      ),
      randomizeOptions: Boolean(singleChoiceConfig.randomizeOptions),
    },
    multipleChoice: {
      options: normalizeOptionList(
        multipleChoiceConfig.options,
        multipleChoiceConfig.correctOptionKeys ?? [],
      ),
      randomizeOptions: Boolean(multipleChoiceConfig.randomizeOptions),
      gradingMode: multipleChoiceConfig.gradingMode ?? "all_or_nothing",
    },
    parametric: resolvedParametric,
  };
}

export function normalizeTags(tags: string[]): string[] {
  return Array.from(
    new Set(tags.map((tag) => tag.trim()).filter((tag) => tag.length > 0)),
  );
}

export function buildQuestionConfig(form: FormState): QuestionTypeConfig {
  switch (form.type) {
    case "true_false":
      return {
        correctAnswer: form.trueFalse.correctAnswer,
        feedbackForTrue: form.trueFalse.feedbackForTrue.trim() || null,
        feedbackForFalse: form.trueFalse.feedbackForFalse.trim() || null,
      };
    case "single_choice": {
      const options = form.singleChoice.options.map((option, index) => ({
        key: option.key || buildOptionKey(index),
        text: option.text.trim(),
        feedback: option.feedback.trim() || null,
      }));

      const correctOption = form.singleChoice.options.find(
        (option) => option.isCorrect,
      );

      return {
        options,
        correctOptionKey: correctOption?.key ?? options[0]?.key ?? "a",
        randomizeOptions: form.singleChoice.randomizeOptions,
      };
    }
    case "multiple_choice": {
      const options = form.multipleChoice.options.map((option, index) => ({
        key: option.key || buildOptionKey(index),
        text: option.text.trim(),
        feedback: option.feedback.trim() || null,
      }));

      return {
        options,
        correctOptionKeys: form.multipleChoice.options
          .filter((option) => option.isCorrect)
          .map((option) => option.key),
        randomizeOptions: form.multipleChoice.randomizeOptions,
        gradingMode: form.multipleChoice.gradingMode,
      };
    }
    case "parametric":
      return {
        templateId: form.parametric.templateId,
      };
  }
}

export function validateForm(form: FormState, t: TFunction): string | null {
  if (form.title.trim().length < 3) {
    return t("questions.dialogs.titleValidation");
  }

  if (form.statement.trim().length === 0) {
    return t("questions.dialogs.statementValidation");
  }

  if (form.type === "single_choice") {
    const options = form.singleChoice.options;

    if (
      options.length < 2 ||
      options.some((option) => option.text.trim().length === 0)
    ) {
      return t("questions.dialogs.optionsValidation");
    }

    if (!options.some((option) => option.isCorrect)) {
      return t("questions.dialogs.singleChoiceValidation");
    }
  }

  if (form.type === "multiple_choice") {
    const options = form.multipleChoice.options;

    if (
      options.length < 2 ||
      options.some((option) => option.text.trim().length === 0)
    ) {
      return t("questions.dialogs.optionsValidation");
    }

    if (!options.some((option) => option.isCorrect)) {
      return t("questions.dialogs.multipleChoiceValidation");
    }
  }

  return null;
}

export function ensureAtLeastOneCorrectOption(
  options: EditableOption[],
): EditableOption[] {
  if (options.some((option) => option.isCorrect) || !options[0]) {
    return options;
  }

  return [{ ...options[0], isCorrect: true }, ...options.slice(1)];
}
