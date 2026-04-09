import type { TrueFalseQuestionConfig } from '../types/question-type-config.type';
import { isPlainObject } from './question-type-config-shared.validator';

export function isValidTrueFalseConfig(
  value: unknown,
): value is TrueFalseQuestionConfig {
  return isPlainObject(value) && typeof value.correctAnswer === 'boolean';
}
