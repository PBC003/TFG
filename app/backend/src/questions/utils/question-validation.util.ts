import { HttpException, HttpStatus } from '@nestjs/common';
import { createAppErrorBody } from '../../common/errors/app-http.exception';
import { QuestionType } from '../enums/question-type.enum';
import type { QuestionTypeConfig } from '../types/question-type-config.type';
import { validateQuestionMathContent } from './question-math-content.util';
import { isValidQuestionTypeConfig } from '../validators/question-type-config.validator';

type QuestionValidationInput = {
  type: QuestionType;
  statement: string;
  explanation: string | null;
  questionConfig: QuestionTypeConfig;
};

export const assertValidQuestionContent = ({
  type,
  statement,
  explanation,
  questionConfig,
}: QuestionValidationInput): void => {
  if (!isValidQuestionTypeConfig(type, questionConfig)) {
    throw new HttpException(
      createAppErrorBody(
        'question.invalid_type_config',
        'questionConfig does not match the selected question type',
      ),
      HttpStatus.BAD_REQUEST,
    );
  }

  const mathValidation = validateQuestionMathContent(
    type,
    statement,
    explanation,
    questionConfig,
  );

  if (!mathValidation.isValid) {
    throw new HttpException(
      createAppErrorBody(
        'question.invalid_math_content',
        'Question content contains invalid LaTeX or forbidden executable markup',
        { fields: mathValidation.errors },
      ),
      HttpStatus.BAD_REQUEST,
    );
  }
};
