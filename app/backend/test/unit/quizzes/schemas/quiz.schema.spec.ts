import {
  Quiz,
  QuizQuestionRef,
  QuizQuestionRefSchema,
  QuizSchema,
} from '../../../../src/quizzes/schemas/quiz.schema';
import { loadModuleWithoutReflect } from '../../helpers/load-without-reflect';

describe('Quiz schema', () => {
  it('defines nested schemas, defaults and indexes', () => {
    expect(new Quiz()).toBeInstanceOf(Quiz);
    expect(new QuizQuestionRef()).toBeInstanceOf(QuizQuestionRef);

    expect(QuizQuestionRefSchema.path('quantity').options.default).toBe(1);
    expect(
      QuizQuestionRefSchema.path('toleranceOverride').options.default,
    ).toBe(null);
    expect(QuizSchema.path('quizId').options.default()).toEqual(
      expect.any(String),
    );
    expect(QuizSchema.indexes()).toEqual(
      expect.arrayContaining([
        [
          expect.objectContaining({ createdByUserId: 1, status: 1 }),
          expect.any(Object),
        ],
        [
          expect.objectContaining({ status: 1, accessCode: 1 }),
          expect.any(Object),
        ],
        [
          expect.objectContaining({ status: 1, assignedGroupIds: 1 }),
          expect.any(Object),
        ],
      ]),
    );
  });

  it('loads the module without Reflect decorator helpers', () => {
    const { Quiz: ReloadedQuiz, QuizSchema: ReloadedQuizSchema } =
      loadModuleWithoutReflect<
        typeof import('../../../../src/quizzes/schemas/quiz.schema')
      >('../../../../src/quizzes/schemas/quiz.schema', __filename);

    expect(new ReloadedQuiz()).toBeInstanceOf(ReloadedQuiz);
    expect(ReloadedQuizSchema.path('questions')).toBeDefined();
  });
});
