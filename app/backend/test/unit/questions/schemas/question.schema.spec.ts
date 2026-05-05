import mongoose from 'mongoose';
import { QuestionType } from '../../../../src/questions/enums/question-type.enum';
import {
  Question,
  QuestionSchema,
} from '../../../../src/questions/schemas/question.schema';
import { loadModuleWithoutReflect } from '../../helpers/load-without-reflect';

describe('Question schema', () => {
  it('defines defaults, indexes and validates the typed config', () => {
    const question = new Question();

    expect(question).toBeInstanceOf(Question);
    expect(QuestionSchema.path('questionId').options.default()).toEqual(
      expect.any(String),
    );
    expect(QuestionSchema.path('isArchived').options.default).toBe(false);
    expect(QuestionSchema.indexes()).toEqual(
      expect.arrayContaining([
        [
          expect.objectContaining({ createdByUserId: 1, type: 1 }),
          expect.any(Object),
        ],
        [expect.objectContaining({ tags: 1 }), expect.any(Object)],
      ]),
    );

    const modelName = `QuestionSchemaSpec_${Date.now()}`;
    const QuestionModel = mongoose.model(modelName, QuestionSchema);

    const validDoc = new QuestionModel({
      title: 'Pregunta válida',
      type: QuestionType.TRUE_FALSE,
      statement: 'Enunciado',
      createdByUserId: 1,
      updatedByUserId: 1,
      questionConfig: { correctAnswer: true },
    });
    expect(validDoc.validateSync()).toBeUndefined();

    const invalidDoc = new QuestionModel({
      title: 'Pregunta inválida',
      type: QuestionType.TRUE_FALSE,
      statement: 'Enunciado',
      createdByUserId: 1,
      updatedByUserId: 1,
      questionConfig: { correctAnswer: 'bad' },
    });
    const validationError = invalidDoc.validateSync();
    expect(validationError?.errors.questionConfig).toBeDefined();

    mongoose.deleteModel(modelName);
  });

  it('loads the module without Reflect decorator helpers', () => {
    const {
      Question: ReloadedQuestion,
      QuestionSchema: ReloadedQuestionSchema,
    } = loadModuleWithoutReflect<
      typeof import('../../../../src/questions/schemas/question.schema')
    >('../../../../src/questions/schemas/question.schema', __filename);

    expect(new ReloadedQuestion()).toBeInstanceOf(ReloadedQuestion);
    expect(ReloadedQuestionSchema.path('questionConfig')).toBeDefined();
  });
});
