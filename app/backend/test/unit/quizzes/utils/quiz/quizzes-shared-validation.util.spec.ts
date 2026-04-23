import { QuestionType } from '../../../../../src/questions/enums/question-type.enum';
import { ParametricQuestionTemplateId } from '../../../../../src/questions/types/question-type-config.type';
import { validateQuizQuestionReference } from '../../../../../src/quizzes/utils/quiz/quizzes-shared-validation.util';

describe('quizzes-shared-validation.util', () => {
  const throwBadRequest = jest.fn((code: string, message: string) => {
    throw new Error(`${code}:${message}`);
  });

  beforeEach(() => {
    throwBadRequest.mockClear();
  });

  it('accepts supported parametric questions and rejects invalid non-parametric quantities', () => {
    expect(() =>
      validateQuizQuestionReference(
        { questionId: 'q-1', points: 1, quantity: 1, toleranceOverride: 0.2 },
        {
          questionId: 'q-1',
          type: QuestionType.PARAMETRIC,
          questionConfig: {
            templateId: ParametricQuestionTemplateId.LIMIT_TRIGONOMETRIC,
          },
        } as never,
        throwBadRequest as never,
      ),
    ).not.toThrow();

    expect(() =>
      validateQuizQuestionReference(
        { questionId: 'q-2', points: 1, quantity: 2 },
        { questionId: 'q-2', type: QuestionType.TRUE_FALSE } as never,
        throwBadRequest as never,
      ),
    ).toThrow(
      'common.bad_request:Only parametric questions can request more than one variant per quiz',
    );
  });
});
