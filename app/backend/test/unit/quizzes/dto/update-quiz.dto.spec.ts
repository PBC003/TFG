import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateQuizDto } from '../../../../src/quizzes/dto/update-quiz.dto';
import { loadModuleWithoutReflect } from '../../helpers/load-without-reflect';

describe('UpdateQuizDto', () => {
  it('validates partial quiz payloads and duplicate question ids', async () => {
    const valid = plainToInstance(UpdateQuizDto, {
      title: 'Quiz actualizado',
      attemptsAllowed: 3,
      questions: [{ questionId: 'q-1', points: 1 }],
    });
    await expect(validate(valid)).resolves.toHaveLength(0);

    const invalid = plainToInstance(UpdateQuizDto, {
      questions: [
        { questionId: 'q-1', points: 1 },
        { questionId: 'q-1', points: 2 },
      ],
    });
    const errors = await validate(invalid);
    expect(errors.map((item) => item.property)).toContain('questions');
  });

  it('loads the module without Reflect decorator helpers', () => {
    const { UpdateQuizDto: ReloadedUpdateQuizDto } = loadModuleWithoutReflect<
      typeof import('../../../../src/quizzes/dto/update-quiz.dto')
    >('../../../../src/quizzes/dto/update-quiz.dto', __filename);

    expect(new ReloadedUpdateQuizDto()).toBeInstanceOf(ReloadedUpdateQuizDto);
  });
});
