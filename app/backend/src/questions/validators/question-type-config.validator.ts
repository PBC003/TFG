import { QuestionType } from '../enums/question-type.enum';
import {
  isValidMultipleChoiceConfig,
  isValidSingleChoiceConfig,
} from './question-choice-config.validator';
import { isValidParametricConfig } from './question-parametric-config.validator';
import { isValidTrueFalseConfig } from './question-true-false-config.validator';

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
