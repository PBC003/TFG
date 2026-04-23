import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateQuizDto } from '../../../../src/quizzes/dto/create-quiz.dto';
import { loadModuleWithoutReflect } from '../../helpers/load-without-reflect';

describe('CreateQuizDto', () => {
  it('validates quiz payloads and exercises unique question selector callbacks', async () => {
    const valid = plainToInstance(CreateQuizDto, {
      title: 'Quiz válido',
      requiresAccessCode: false,
      attemptsAllowed: 2,
      shuffleQuestions: false,
      revealAnswersAfterClose: true,
      assignedGroupIds: ['g-1'],
      questions: [{ questionId: 'q-1', points: 1 }],
    });
    await expect(validate(valid)).resolves.toHaveLength(0);

    const invalid = plainToInstance(CreateQuizDto, {
      title: 'Quiz válido',
      requiresAccessCode: false,
      attemptsAllowed: 2,
      shuffleQuestions: false,
      revealAnswersAfterClose: true,
      questions: [
        { questionId: 'q-1', points: 1 },
        { questionId: 'q-1', points: 2 },
      ],
    });
    const errors = await validate(invalid);
    expect(errors.map((item) => item.property)).toContain('questions');
  });

  it('loads the module without Reflect decorator helpers', () => {
    const { CreateQuizDto: ReloadedCreateQuizDto } = loadModuleWithoutReflect<
      typeof import('../../../../src/quizzes/dto/create-quiz.dto')
    >('../../../../src/quizzes/dto/create-quiz.dto', __filename);

    expect(new ReloadedCreateQuizDto()).toBeInstanceOf(ReloadedCreateQuizDto);
  });
});
