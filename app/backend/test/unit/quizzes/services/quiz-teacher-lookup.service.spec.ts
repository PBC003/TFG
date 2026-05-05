import { QuizTeacherLookupService } from '../../../../src/quizzes/services/quiz-teacher-lookup.service';

describe('QuizTeacherLookupService', () => {
  it('maps teacher ids to full names', async () => {
    const repository = {
      findBy: jest
        .fn()
        .mockResolvedValue([{ id: 4, firstName: 'Ada', lastName: 'Lovelace' }]),
    };
    const service = new QuizTeacherLookupService(repository as never);

    await expect(service.loadTeacherNamesById([4, 4])).resolves.toEqual(
      new Map([[4, 'Ada Lovelace']]),
    );
  });
});
