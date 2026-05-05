import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createAppErrorBody } from '../../common/errors/app-http.exception';
import { Quiz, type QuizDocument } from '../schemas/quiz.schema';
import {
  generateAccessCode,
  normalizeAccessCode,
} from '../utils/access-code.util';

@Injectable()
export class QuizAccessCodeService {
  constructor(
    @InjectModel(Quiz.name)
    private readonly quizModel: Model<QuizDocument>,
  ) {}

  normalizeAccessCode(value: string | null | undefined): string {
    return normalizeAccessCode(value);
  }

  generateAccessCode(): string {
    return generateAccessCode();
  }

  async assertAccessCodeIsAvailable(
    accessCode: string,
    currentQuizId?: string,
  ): Promise<void> {
    const existingQuiz = await this.quizModel
      .findOne({ accessCode })
      .select(['quizId'])
      .exec();

    if (!existingQuiz) {
      return;
    }

    if (currentQuizId && existingQuiz.quizId === currentQuizId) {
      return;
    }

    throw new HttpException(
      createAppErrorBody(
        'quiz.access_code_already_exists',
        'The selected quiz access code is already in use',
      ),
      HttpStatus.CONFLICT,
    );
  }
}
