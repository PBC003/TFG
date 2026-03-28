import { QuestionType } from '../enums/question-type.enum';
import type {
  MultipleChoiceQuestionConfig,
  ParametricQuestionConfig,
  ParametricQuestionVariable,
  QuestionOption,
  SingleChoiceQuestionConfig,
  TrueFalseQuestionConfig,
} from '../types/question-type-config.type';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyTrimmedString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

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

function isValidTrueFalseConfig(
  value: unknown,
): value is TrueFalseQuestionConfig {
  return isPlainObject(value) && typeof value.correctAnswer === 'boolean';
}

function isValidSingleChoiceConfig(
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

function isValidMultipleChoiceConfig(
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

function isValidParametricVariable(
  variable: unknown,
): variable is ParametricQuestionVariable {
  if (!isPlainObject(variable)) {
    return false;
  }

  if (!isNonEmptyTrimmedString(variable.name)) {
    return false;
  }

  if (!isFiniteNumber(variable.min) || !isFiniteNumber(variable.max)) {
    return false;
  }

  if (variable.min > variable.max) {
    return false;
  }

  const step = variable.step;

  if (step !== undefined && step !== null) {
    if (!isFiniteNumber(step) || step <= 0) {
      return false;
    }
  }

  const precision = variable.precision;

  if (precision !== undefined && precision !== null) {
    if (
      !isFiniteNumber(precision) ||
      !Number.isInteger(precision) ||
      precision < 0
    ) {
      return false;
    }
  }

  return true;
}

function isValidParametricVariables(
  value: unknown,
): value is ParametricQuestionVariable[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((variable) => isValidParametricVariable(variable))
  );
}

function hasUniqueVariableNames(
  variables: ParametricQuestionConfig['variables'],
): boolean {
  const names = variables.map((variable) => variable.name);
  return new Set(names).size === names.length;
}

function isValidParametricConfig(
  value: unknown,
): value is ParametricQuestionConfig {
  if (!isPlainObject(value)) {
    return false;
  }

  if (!isValidParametricVariables(value.variables)) {
    return false;
  }

  if (!hasUniqueVariableNames(value.variables)) {
    return false;
  }

  if (!isNonEmptyTrimmedString(value.answerFormula)) {
    return false;
  }

  if (value.tolerance !== undefined && !isFiniteNumber(value.tolerance)) {
    return false;
  }

  if (isFiniteNumber(value.tolerance) && value.tolerance < 0) {
    return false;
  }

  if (
    value.sampleAnswer !== undefined &&
    !isNonEmptyTrimmedString(value.sampleAnswer)
  ) {
    return false;
  }

  return true;
}

export function isValidQuestionTypeConfig(
  type: QuestionType,
  value: unknown,
): boolean {
  switch (type) {
    case QuestionType.TRUE_FALSE:
      return isValidTrueFalseConfig(value);
    case QuestionType.SINGLE_CHOICE:
      return isValidSingleChoiceConfig(value);
    case QuestionType.MULTIPLE_CHOICE:
      return isValidMultipleChoiceConfig(value);
    case QuestionType.PARAMETRIC:
      return isValidParametricConfig(value);
    default:
      return false;
  }
}
