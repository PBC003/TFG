import { gradeParametricQuestion } from '../../../../../src/quizzes/utils/grade/grade-parametric.util';

describe('gradeParametricQuestion', () => {
  const snapshot = {
    questionId: 'q-1',
    points: 3,
    explanation: 'Explicación',
    questionConfig: {
      correctAnswerNumeric: 2,
      correctAnswerLatex: '2',
      tolerance: 0.1,
    },
  };

  it('grades correct answers inside tolerance and appends explanation feedback', () => {
    const result = gradeParametricQuestion(snapshot as never, ' 2.05 ');

    expect(result.isCorrect).toBe(true);
    expect(result.earnedPoints).toBe(3);
    expect(result.answer.value).toBe('2.05');
    expect(result.answer.answeredAt).toBeInstanceOf(Date);
    expect(result.feedback).toContain('Explicación');
    expect(result.feedback).toContain('Se acepta un error absoluto');
  });

  it('returns zero points and tolerance-only feedback when the answer is empty or invalid', () => {
    const emptyResult = gradeParametricQuestion(
      { ...snapshot, explanation: null } as never,
      '   ',
    );
    expect(emptyResult.isCorrect).toBe(false);
    expect(emptyResult.earnedPoints).toBe(0);
    expect(emptyResult.answer.answeredAt).toBeNull();
    expect(emptyResult.feedback).toBe(
      'Se acepta un error absoluto de hasta 0.1.',
    );

    const invalidResult = gradeParametricQuestion(
      snapshot as never,
      'not-a-number',
    );
    expect(invalidResult.isCorrect).toBe(false);
    expect(invalidResult.earnedPoints).toBe(0);
    expect(invalidResult.answer.answeredAt).toBeInstanceOf(Date);
  });
});
