import {
  QuizAttempt,
  QuizAttemptAnswer,
  QuizAttemptAnswerSchema,
  QuizAttemptQuestionSnapshot,
  QuizAttemptQuestionSnapshotSchema,
  QuizAttemptSchema,
} from '../../../../src/quizzes/schemas/quiz-attempt.schema';
import { loadModuleWithoutReflect } from '../../helpers/load-without-reflect';

describe('QuizAttempt schema', () => {
  it('defines nested schemas, defaults and indexes', () => {
    expect(new QuizAttempt()).toBeInstanceOf(QuizAttempt);
    expect(new QuizAttemptAnswer()).toBeInstanceOf(QuizAttemptAnswer);
    expect(new QuizAttemptQuestionSnapshot()).toBeInstanceOf(
      QuizAttemptQuestionSnapshot,
    );

    expect(QuizAttemptAnswerSchema.path('value').options.default).toBe(null);
    expect(
      QuizAttemptQuestionSnapshotSchema.path('tags').options.default,
    ).toEqual([]);
    expect(QuizAttemptSchema.path('attemptId').options.default()).toEqual(
      expect.any(String),
    );
    expect(QuizAttemptSchema.indexes()).toEqual(
      expect.arrayContaining([
        [
          expect.objectContaining({
            quizId: 1,
            participantName: 1,
            startedAt: -1,
          }),
          expect.any(Object),
        ],
        [
          expect.objectContaining({ attemptId: 1, status: 1 }),
          expect.any(Object),
        ],
        [
          expect.objectContaining({ quizId: 1, isPreview: 1, startedAt: -1 }),
          expect.any(Object),
        ],
      ]),
    );
  });

  it('loads the module without Reflect decorator helpers', () => {
    const {
      QuizAttempt: ReloadedQuizAttempt,
      QuizAttemptSchema: ReloadedQuizAttemptSchema,
    } = loadModuleWithoutReflect<
      typeof import('../../../../src/quizzes/schemas/quiz-attempt.schema')
    >('../../../../src/quizzes/schemas/quiz-attempt.schema', __filename);

    expect(new ReloadedQuizAttempt()).toBeInstanceOf(ReloadedQuizAttempt);
    expect(ReloadedQuizAttemptSchema.path('answers')).toBeDefined();
  });
});
