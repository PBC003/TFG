import { QuizCatalogService } from '../../../../src/quizzes/services/quiz-catalog.service';
import { QuizStatus } from '../../../../src/quizzes/enums/quiz-status.enum';

describe('QuizCatalogService', () => {
  it('returns catalog items for visible quizzes', async () => {
    const quizModel = {
      find: jest.fn(() => ({
        sort: jest.fn(() => ({
          exec: jest.fn().mockResolvedValue([
            {
              quizId: 'quiz-1',
              title: 'Quiz 1',
              description: 'Desc',
              createdByUserId: 2,
              attemptsAllowed: 2,
              requiresAccessCode: false,
              audienceScope: 'all',
              status: QuizStatus.PUBLISHED,
              publishedAt: new Date('2026-01-01T00:00:00.000Z'),
              updatedAt: new Date('2026-01-01T00:00:00.000Z'),
              startAt: null,
              endAt: null,
              questions: [{ questionId: 'q1', points: 1 }],
            },
          ]),
        })),
      })),
    };
    const service = new QuizCatalogService(
      quizModel as never,
      {} as never,
      {
        getAccessibleGroupIdsForParticipant: jest
          .fn()
          .mockResolvedValue(new Set()),
        countConsumedAttempts: jest.fn().mockResolvedValue(0),
      } as never,
      {
        loadTeacherNamesById: jest
          .fn()
          .mockResolvedValue(new Map([[2, 'Ada Lovelace']])),
      } as never,
    );

    const catalog = await service.listPublishedQuizzes('user:7');

    expect(catalog).toHaveLength(1);
    expect(catalog[0]?.quizId).toBe('quiz-1');
  });
});
