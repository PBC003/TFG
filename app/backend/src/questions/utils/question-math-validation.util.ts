import { QuestionType } from '../enums/question-type.enum';
import type {
  MultipleChoiceQuestionConfig,
  ParametricQuestionConfig,
  QuestionOption,
  QuestionTypeConfig,
  SingleChoiceQuestionConfig,
} from '../types/question-type-config.type';
import type {
  QuestionMathFieldError,
  QuestionMathValidationResult,
} from './question-math-content.types';
import { validateMathTextContent } from './math-text-content.util';

function validateOptionTexts(
  options: QuestionOption[],
  prefix: string,
): QuestionMathFieldError[] {
  return options.flatMap((option, index) =>
    validateMathTextContent(option.text, `${prefix}.options[${index}].text`),
  );
}

export function validateQuestionMathContent(
  type: QuestionType,
  statement: string,
  explanation: string | null,
  questionConfig: QuestionTypeConfig,
): QuestionMathValidationResult {
  const errors: QuestionMathFieldError[] = [
    ...validateMathTextContent(statement, 'statement'),
  ];

  if (explanation !== null) {
    errors.push(...validateMathTextContent(explanation, 'explanation'));
  }

  switch (type) {
    case QuestionType.SINGLE_CHOICE: {
      const config = questionConfig as SingleChoiceQuestionConfig;
      errors.push(...validateOptionTexts(config.options, 'questionConfig'));
      break;
    }
    case QuestionType.MULTIPLE_CHOICE: {
      const config = questionConfig as MultipleChoiceQuestionConfig;
      errors.push(...validateOptionTexts(config.options, 'questionConfig'));
      break;
    }
    case QuestionType.PARAMETRIC: {
      const config = questionConfig as ParametricQuestionConfig;
      errors.push(
        ...validateMathTextContent(
          config.answerFormula,
          'questionConfig.answerFormula',
        ),
      );

      if (config.sampleAnswer !== undefined) {
        errors.push(
          ...validateMathTextContent(
            config.sampleAnswer,
            'questionConfig.sampleAnswer',
          ),
        );
      }
      break;
    }
    default:
      break;
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
