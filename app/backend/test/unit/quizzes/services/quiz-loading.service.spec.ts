import { QuizLoadingService } from '../../../../src/quizzes/services/quiz-loading.service';

describe('QuizLoadingService', () => {
  it('returns empty maps for empty identifiers', async () => {
    const service = new QuizLoadingService(
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );

    await expect(service.loadQuestionsMap([])).resolves.toEqual(new Map());
    await expect(service.loadGroupsMap([])).resolves.toEqual(new Map());
  });

  it('returns an empty set for malformed participant names', async () => {
    const groupModel = { find: jest.fn() };
    const service = new QuizLoadingService(
      {} as never,
      {} as never,
      {} as never,
      groupModel as never,
    );

    await expect(
      service.getAccessibleGroupIdsForParticipant('anonymous'),
    ).resolves.toEqual(new Set());
    expect(groupModel.find).not.toHaveBeenCalled();
  });
});
