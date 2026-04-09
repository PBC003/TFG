import type {
  MultipleChoiceQuestionConfig,
  QuestionOption,
  SingleChoiceQuestionConfig,
} from '../types/question-type-config.type';
import {
  isNonEmptyTrimmedString,
  isPlainObject,
} from './question-type-config-shared.validator';

function hasUniqueOptionKeys(options: QuestionOption[]): boolean {
  const keys = options.map((option) => option.key);
  return new Set(keys).size === keys.length;
}

function isValidOption(option: unknown): option is QuestionOption {
  if (!isPlainObject(option)) {
    return false;
  }

  return (
    isNonEmptyTrimmedString(option.key) && isNonEmptyTrimmedString(option.text)
  );
}

function isValidOptionsArray(value: unknown): value is QuestionOption[] {
  return (
    Array.isArray(value) &&
    value.length >= 2 &&
    value.every((option) => isValidOption(option)) &&
    hasUniqueOptionKeys(value)
  );
}

export function isValidSingleChoiceConfig(
  value: unknown,
): value is SingleChoiceQuestionConfig {
  if (!isPlainObject(value) || !isValidOptionsArray(value.options)) {
    return false;
  }

  if (!isNonEmptyTrimmedString(value.correctOptionKey)) {
    return false;
  }

  return value.options.some((option) => option.key === value.correctOptionKey);
}

export function isValidMultipleChoiceConfig(
  value: unknown,
): value is MultipleChoiceQuestionConfig {
  if (!isPlainObject(value) || !isValidOptionsArray(value.options)) {
    return false;
  }

  if (
    !Array.isArray(value.correctOptionKeys) ||
    value.correctOptionKeys.length === 0 ||
    !value.correctOptionKeys.every((key) => isNonEmptyTrimmedString(key))
  ) {
    return false;
  }

  const optionKeys = new Set(value.options.map((option) => option.key));
  const correctOptionKeys = new Set(value.correctOptionKeys);

  if (correctOptionKeys.size !== value.correctOptionKeys.length) {
    return false;
  }

  return Array.from(correctOptionKeys).every((key) => optionKeys.has(key));
}
