import { QuestionType } from '../../../../../src/questions/enums/question-type.enum';
import { gradeMultipleChoiceQuestion } from '../../../../../src/quizzes/utils/grade/grade-multiple-choice.util';

describe('grade-multiple-choice.util', () => {
  const multipleChoiceSnapshot = {
    questionId: 'q-multi',
    title: 'Multiple',
    type: QuestionType.MULTIPLE_CHOICE,
    statement: 'Choose several',
    explanation: 'multi explanation',
    tags: [],
    points: 4,
    order: 1,
    questionConfig: {
      options: [
        { key: 'a', text: 'A', feedback: 'feedback A' },
        { key: 'b', text: 'B', feedback: 'feedback B' },
        { key: 'c', text: 'C' },
      ],
      correctOptionKeys: ['a', 'b'],
      gradingMode: 'partial_credit',
    },
  };

  it('grades multiple-choice answers with partial and all-or-nothing modes', () => {
    const partial = gradeMultipleChoiceQuestion(
      multipleChoiceSnapshot as never,
      ['a', 'c'],
    );
    expect(partial.isCorrect).toBe(false);
    expect(partial.earnedPoints).toBe(0);
    expect(partial.feedback).toBe('feedback A');

    const full = gradeMultipleChoiceQuestion(
      {
        ...multipleChoiceSnapshot,
        questionConfig: {
          ...multipleChoiceSnapshot.questionConfig,
          gradingMode: 'all_or_nothing',
        },
      } as never,
      ['b', 'a', 'a'],
    );
    expect(full.isCorrect).toBe(true);
    expect(full.earnedPoints).toBe(4);

    const unanswered = gradeMultipleChoiceQuestion(
      multipleChoiceSnapshot as never,
      null,
    );
    expect(unanswered.submittedValue).toEqual([]);
    expect(unanswered.answer.answeredAt).toBeNull();
  });

  it('falls back to explanation and handles empty correct answers in partial mode', () => {
    const result = gradeMultipleChoiceQuestion(
      {
        ...multipleChoiceSnapshot,
        explanation: 'fallback explanation',
        questionConfig: {
          ...multipleChoiceSnapshot.questionConfig,
          options: [{ key: 'z', text: 'Z' }],
          correctOptionKeys: [],
          gradingMode: 'partial_credit',
        },
      } as never,
      ['z'],
    );

    expect(result.isCorrect).toBe(false);
    expect(result.earnedPoints).toBe(0);
    expect(result.feedback).toBe('fallback explanation');
  });
});
