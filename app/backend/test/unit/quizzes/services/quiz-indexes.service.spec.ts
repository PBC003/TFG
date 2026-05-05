import { QuizIndexesService } from '../../../../src/quizzes/services/quiz-indexes.service';

describe('QuizIndexesService', () => {
  const createService = () => {
    const collection = {
      indexes: jest.fn(),
      dropIndex: jest.fn(),
      createIndex: jest.fn(),
    };

    const quizModel = {
      collection,
    };

    const service = new QuizIndexesService(quizModel as never);
    return { service, collection };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('drops the legacy unique accessCode index and ensures a plain one exists', async () => {
    const { service, collection } = createService();
    collection.indexes.mockResolvedValueOnce([
      { name: '_id_', key: { _id: 1 } },
      { name: 'accessCode_1', key: { accessCode: 1 }, unique: true },
    ]);

    await service.onModuleInit();

    expect(collection.dropIndex).toHaveBeenCalledWith('accessCode_1');
    expect(collection.createIndex).toHaveBeenCalledWith(
      { accessCode: 1 },
      { name: 'accessCode_1' },
    );
  });

  it('skips collection work when a normalized non-unique index already exists', async () => {
    const { service, collection } = createService();
    collection.indexes.mockResolvedValueOnce([
      { name: 'accessCode_1', key: { accessCode: 1 }, unique: false },
    ]);

    await service.onModuleInit();

    expect(collection.dropIndex).not.toHaveBeenCalled();
    expect(collection.createIndex).not.toHaveBeenCalled();
  });
});
