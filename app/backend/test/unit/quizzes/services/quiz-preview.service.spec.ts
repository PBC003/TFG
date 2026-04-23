import { QuizPreviewService } from '../../../../src/quizzes/services/quiz-preview.service';

describe('QuizPreviewService', () => {
  it('delegates preview creation to the starter service', async () => {
    const starter = {
      startPreview: jest.fn().mockResolvedValue({ attemptId: 'preview-1' }),
    };
    const service = new QuizPreviewService(starter as never);

    await expect(
      service.startPreview('quiz-1', { id: 1, role: 'admin' } as never),
    ).resolves.toEqual({ attemptId: 'preview-1' });
    expect(starter.startPreview).toHaveBeenCalledWith('quiz-1', {
      id: 1,
      role: 'admin',
    });
  });
});
