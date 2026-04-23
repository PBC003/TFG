import { QuestionType } from '../../../../src/questions/enums/question-type.enum';
import { ParametricQuestionTemplateId } from '../../../../src/questions/types/question-type-config.type';
import {
  applyQuestionUpdate,
  normalizeCreateQuestionData,
  normalizeUpdateQuestionData,
  resolveValidatedQuestionSnapshot,
} from '../../../../src/questions/utils/question-payload.util';

describe('question-payload.util', () => {
  it('normalizes create payloads by trimming values, deduplicating tags and canonicalizing parametric statements', () => {
    expect(
      normalizeCreateQuestionData({
        title: '  Sumas  ',
        type: QuestionType.SINGLE_CHOICE,
        statement: '  ¿Cuál?  ',
        explanation: '  Porque sí  ',
        tags: [' algebra ', 'calculo', 'algebra', ''],
        questionConfig: {
          options: [
            { key: ' a ', text: ' Opción A ' },
            { key: 'b', text: 'Opción B' },
          ],
          correctOptionKey: ' a ',
        },
      } as never),
    ).toEqual({
      title: 'Sumas',
      type: QuestionType.SINGLE_CHOICE,
      statement: '¿Cuál?',
      explanation: 'Porque sí',
      tags: ['algebra', 'calculo'],
      questionConfig: {
        options: [
          { key: 'a', text: 'Opción A' },
          { key: 'b', text: 'Opción B' },
        ],
        correctOptionKey: 'a',
      },
    });

    expect(
      normalizeCreateQuestionData({
        title: '  Paramétrica ',
        type: QuestionType.PARAMETRIC,
        statement: ' se ignora ',
        explanation: undefined,
        tags: undefined,
        questionConfig: {
          templateId: ParametricQuestionTemplateId.SERIES_GEOMETRIC,
          tolerance: 0.0100001,
        },
      } as never),
    ).toEqual(
      expect.objectContaining({
        title: 'Paramétrica',
        statement: expect.stringContaining('sum'),
        explanation: null,
        tags: [],
        questionConfig: {
          templateId: ParametricQuestionTemplateId.SERIES_GEOMETRIC,
          tolerance: 0.01,
        },
      }),
    );
  });

  it('normalizes partial update payloads including null explanations', () => {
    expect(
      normalizeUpdateQuestionData({
        title: '  Nuevo título ',
        statement: '  Nuevo enunciado ',
        explanation: null,
        tags: [' uno ', '', 'uno', ' dos '],
        questionConfig: {
          templateId: ParametricQuestionTemplateId.INTEGRAL_LOGARITHMIC,
          tolerance: 0.5,
        },
      } as never),
    ).toEqual({
      title: 'Nuevo título',
      statement: 'Nuevo enunciado',
      explanation: null,
      tags: ['uno', 'dos'],
      questionConfig: {
        templateId: ParametricQuestionTemplateId.INTEGRAL_LOGARITHMIC,
        tolerance: 0.5,
      },
    });
  });

  it('resolves validated snapshots using existing values when updates are missing', () => {
    const question = {
      type: QuestionType.PARAMETRIC,
      statement: 'old',
      explanation: 'old explanation',
      questionConfig: {
        templateId: ParametricQuestionTemplateId.INTEGRAL_LOGARITHMIC,
        tolerance: 0.25,
      },
    };

    expect(
      resolveValidatedQuestionSnapshot(question as never, {
        explanation: null,
      }),
    ).toEqual({
      type: QuestionType.PARAMETRIC,
      statement: expect.stringContaining('\\frac'),
      explanation: null,
      questionConfig: question.questionConfig,
    });

    expect(
      resolveValidatedQuestionSnapshot(question as never, {
        type: QuestionType.SINGLE_CHOICE,
        statement: '  Manual ',
        questionConfig: {
          options: [
            { key: ' a ', text: ' Opción A ' },
            { key: 'b', text: 'Opción B' },
          ],
          correctOptionKey: 'b',
        },
      }),
    ).toEqual({
      type: QuestionType.SINGLE_CHOICE,
      statement: '  Manual ',
      explanation: 'old explanation',
      questionConfig: {
        options: [
          { key: 'a', text: 'Opción A' },
          { key: 'b', text: 'Opción B' },
        ],
        correctOptionKey: 'b',
      },
    });
  });

  it('applies updates and rebuilds canonical parametric statements', () => {
    const question = {
      title: 'Original',
      type: QuestionType.PARAMETRIC,
      statement: 'manual',
      explanation: 'old explanation',
      tags: ['old'],
      questionConfig: {
        templateId: ParametricQuestionTemplateId.INTEGRAL_LOGARITHMIC,
        tolerance: 0.25,
      },
    };

    applyQuestionUpdate(question as never, {
      title: 'Nuevo',
      explanation: 'explicada',
      tags: ['a', 'b'],
      questionConfig: {
        templateId: ParametricQuestionTemplateId.SERIES_GEOMETRIC,
        tolerance: 0.1,
      },
    });

    expect(question).toEqual(
      expect.objectContaining({
        title: 'Nuevo',
        type: QuestionType.PARAMETRIC,
        explanation: 'explicada',
        tags: ['a', 'b'],
        questionConfig: {
          templateId: ParametricQuestionTemplateId.SERIES_GEOMETRIC,
          tolerance: 0.1,
        },
        statement: expect.stringContaining('sum'),
      }),
    );
  });
});
