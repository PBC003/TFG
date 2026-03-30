import type {
  ParametricQuestionConfig,
  ParametricQuestionVariable,
} from '../types/question-type-config.type';
import {
  isFiniteNumber,
  isNonEmptyTrimmedString,
  isPlainObject,
} from './question-type-config-shared.validator';

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

export function isValidParametricConfig(
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
