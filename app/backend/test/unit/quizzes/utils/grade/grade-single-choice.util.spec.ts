import { QuestionType } from '../../../../../src/questions/enums/question-type.enum';
import { gradeSingleChoiceQuestion } from '../../../../../src/quizzes/utils/grade/grade-single-choice.util';

describe('grade-single-choice.util', () => {
  const singleChoiceSnapshot = {
    questionId: 'q-single',
    title: 'Single',
    type: QuestionType.SINGLE_CHOICE,
    statement: 'Choose one',
    explanation: 'single explanation',
    tags: ['tag'],
    points: 2,
    order: 2,
    questionConfig: {
      options: [
        { key: 'a', text: 'A', feedback: ' feedback A ' },
        { key: 'b', text: 'B' },
      ],
      correctOptionKey: 'a',
    },
  };

  it('grades single-choice answers and falls back to question explanation', () => {
    const correct = gradeSingleChoiceQuestion(
      singleChoiceSnapshot as never,
      'a',
    );
    expect(correct.isCorrect).toBe(true);
    expect(correct.feedback).toBe('feedback A');
    expect(correct.earnedPoints).toBe(2);

    const wrong = gradeSingleChoiceQuestion(singleChoiceSnapshot as never, 'b');
    expect(wrong.isCorrect).toBe(false);
    expect(wrong.feedback).toBe('single explanation');

    const unanswered = gradeSingleChoiceQuestion(
      singleChoiceSnapshot as never,
      null,
    );
    expect(unanswered.submittedValue).toBeNull();
    expect(unanswered.answer.answeredAt).toBeNull();
  });
});
