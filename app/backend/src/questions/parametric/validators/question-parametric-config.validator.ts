import type { ParametricQuestionConfig } from '../../types/question-type-config.type';
import { isParametricQuestionTemplateId } from '../parametric-question-template.util';
import {
  isFiniteNumber,
  isPlainObject,
} from '../../validators/question-type-config-shared.validator';

export function isValidParametricConfig(
  value: unknown,
): value is ParametricQuestionConfig {
  if (!isPlainObject(value)) {
    return false;
  }

  if (!isParametricQuestionTemplateId(value.templateId)) {
    return false;
  }

  if (value.tolerance !== undefined && !isFiniteNumber(value.tolerance)) {
    return false;
  }

  if (isFiniteNumber(value.tolerance) && value.tolerance < 0) {
    return false;
  }

  return true;
}
