import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SubmitQuizAttemptDto } from '../../../../src/quizzes/dto/submit-quiz-attempt.dto';
import { loadModuleWithoutReflect } from '../../helpers/load-without-reflect';

describe('SubmitQuizAttemptDto', () => {
  it('validates nested answers', async () => {
    const valid = plainToInstance(SubmitQuizAttemptDto, {
      answers: [{ questionId: 'q-1', value: true }],
    });
    await expect(validate(valid)).resolves.toHaveLength(0);

    const invalid = plainToInstance(SubmitQuizAttemptDto, {
      answers: [{ questionId: 'q-1' }],
    });
    const errors = await validate(invalid);
    expect(errors.map((item) => item.property)).toContain('answers');
  });

  it('loads the module without Reflect decorator helpers', () => {
    const {
      SubmitQuizAttemptDto: ReloadedSubmitQuizAttemptDto,
      SubmitQuizAttemptAnswerDto: ReloadedSubmitQuizAttemptAnswerDto,
    } = loadModuleWithoutReflect<
      typeof import('../../../../src/quizzes/dto/submit-quiz-attempt.dto')
    >('../../../../src/quizzes/dto/submit-quiz-attempt.dto', __filename);

    expect(new ReloadedSubmitQuizAttemptDto()).toBeInstanceOf(
      ReloadedSubmitQuizAttemptDto,
    );
    expect(new ReloadedSubmitQuizAttemptAnswerDto()).toBeInstanceOf(
      ReloadedSubmitQuizAttemptAnswerDto,
    );
  });
});
