import { QuestionType } from '../../../../../src/questions/enums/question-type.enum';
import { gradeTrueFalseQuestion } from '../../../../../src/quizzes/utils/grade/grade-true-false.util';

describe('grade-true-false.util', () => {
  const trueFalseSnapshot = {
    questionId: 'q-tf',
    title: 'True false',
    type: QuestionType.TRUE_FALSE,
    statement: 'Is it true?',
    explanation: 'tf explanation',
    tags: [],
    points: 1,
    order: 0,
    questionConfig: {
      correctAnswer: true,
      feedbackForTrue: ' feedback true ',
      feedbackForFalse: ' feedback false ',
    },
  };

  it('grades true/false answers with specific feedback and unanswered fallback', () => {
    const correct = gradeTrueFalseQuestion(trueFalseSnapshot as never, true);
    expect(correct.isCorrect).toBe(true);
    expect(correct.earnedPoints).toBe(1);
    expect(correct.feedback).toBe('feedback true');
    expect(correct.answer.answeredAt).toBeInstanceOf(Date);

    const wrong = gradeTrueFalseQuestion(trueFalseSnapshot as never, false);
    expect(wrong.isCorrect).toBe(false);
    expect(wrong.earnedPoints).toBe(0);
    expect(wrong.feedback).toBe('feedback false');

    const unanswered = gradeTrueFalseQuestion(trueFalseSnapshot as never, 'x');
    expect(unanswered.submittedValue).toBeNull();
    expect(unanswered.answer.answeredAt).toBeNull();
    expect(unanswered.feedback).toBe('tf explanation');
  });
});
