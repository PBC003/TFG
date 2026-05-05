import { QuestionType } from '../../../../../src/questions/enums/question-type.enum';
import { assertSubmittedParametricAnswersAreValid } from '../../../../../src/quizzes/utils/quiz/quiz-access-submission.util';

describe('quiz-access-submission.util', () => {
  it('allows empty or non-parametric answers and rejects invalid expressions', () => {
    const throwBadRequest = jest.fn((code: string, message: string) => {
      throw new Error(`${code}:${message}`);
    });

    expect(() =>
      assertSubmittedParametricAnswersAreValid(
        [
          { questionId: 'q-1', type: QuestionType.PARAMETRIC },
          { questionId: 'q-2', type: QuestionType.TRUE_FALSE },
        ] as never,
        [
          { questionId: 'q-1', value: '  ' },
          { questionId: 'q-2', value: 'abc' },
        ] as never,
        throwBadRequest as never,
      ),
    ).not.toThrow();

    expect(() =>
      assertSubmittedParametricAnswersAreValid(
        [{ questionId: 'q-1', type: QuestionType.PARAMETRIC }] as never,
        [{ questionId: 'q-1', value: '2**3' }] as never,
        throwBadRequest as never,
      ),
    ).toThrow(
      'quiz.invalid_parametric_answer_format:One parametric answer contains an invalid numeric expression',
    );
  });
});
