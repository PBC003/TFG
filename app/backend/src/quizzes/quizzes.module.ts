import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question, QuestionSchema } from '../questions/schemas/question.schema';
import { User } from '../users/entities/user.entity';
import { QuizAccessController } from './quiz-access.controller';
import { QuizzesController } from './quizzes.controller';
import { QuizzesService } from './quizzes.service';
import { QuizAttempt, QuizAttemptSchema } from './schemas/quiz-attempt.schema';
import { Quiz, QuizSchema } from './schemas/quiz.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Quiz.name,
        schema: QuizSchema,
      },
      {
        name: QuizAttempt.name,
        schema: QuizAttemptSchema,
      },
      {
        name: Question.name,
        schema: QuestionSchema,
      },
    ]),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [QuizzesController, QuizAccessController],
  providers: [QuizzesService],
  exports: [QuizzesService, MongooseModule],
})
export class QuizzesModule {}
