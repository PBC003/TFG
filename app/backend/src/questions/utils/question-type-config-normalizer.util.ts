import { QuestionType } from '../enums/question-type.enum';
import type {
  MultipleChoiceQuestionConfig,
  ParametricQuestionConfig,
  QuestionOption,
  QuestionTypeConfig,
  SingleChoiceQuestionConfig,
} from '../types/question-type-config.type';

function normalizeOption(option: QuestionOption): QuestionOption {
  return {
    key: option.key.trim(),
    text: option.text.trim(),
  };
}

function normalizeSingleChoiceConfig(
  config: SingleChoiceQuestionConfig,
): SingleChoiceQuestionConfig {
  return {
    ...config,
    options: config.options.map((option) => normalizeOption(option)),
    correctOptionKey: config.correctOptionKey.trim(),
  };
}

function normalizeMultipleChoiceConfig(
  config: MultipleChoiceQuestionConfig,
): MultipleChoiceQuestionConfig {
  return {
    ...config,
    options: config.options.map((option) => normalizeOption(option)),
    correctOptionKeys: config.correctOptionKeys.map((key) => key.trim()),
  };
}

function normalizeParametricConfig(
  config: ParametricQuestionConfig,
): ParametricQuestionConfig {
  return {
    ...config,
    tolerance:
      config.tolerance === undefined
        ? undefined
        : Number(config.tolerance.toFixed(6)),
  };
}

export function normalizeQuestionTypeConfig(
  type: QuestionType,
  questionConfig: QuestionTypeConfig,
): QuestionTypeConfig {
  switch (type) {
    case QuestionType.TRUE_FALSE:
      return questionConfig;
    case QuestionType.SINGLE_CHOICE:
      return normalizeSingleChoiceConfig(
        questionConfig as SingleChoiceQuestionConfig,
      );
    case QuestionType.MULTIPLE_CHOICE:
      return normalizeMultipleChoiceConfig(
        questionConfig as MultipleChoiceQuestionConfig,
      );
    case QuestionType.PARAMETRIC:
      return normalizeParametricConfig(
        questionConfig as ParametricQuestionConfig,
      );
    default:
      return questionConfig;
  }
}
