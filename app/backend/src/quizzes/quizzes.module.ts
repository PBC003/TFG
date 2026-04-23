import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group, GroupSchema } from '../groups/schemas/group.schema';
import { Question, QuestionSchema } from '../questions/schemas/question.schema';
import { User } from '../users/entities/user.entity';
import { QuizAccessController } from './quiz-access.controller';
import { QuizAnalyticsController } from './quiz-analytics.controller';
import { QuizHistoryController } from './quiz-history.controller';
import { QuizPreviewController } from './quiz-preview.controller';
import { QuizAccessService } from './quiz-access.service';
import { QuizIndexesService } from './services/quiz-indexes.service';
import { QuizAnalyticsService } from './quiz-analytics.service';
import { QuizzesController } from './quizzes.controller';
import { QuizzesService } from './quizzes.service';
import { QuizzesSharedService } from './quizzes-shared.service';
import { QuizAttempt, QuizAttemptSchema } from './schemas/quiz-attempt.schema';
import { Quiz, QuizSchema } from './schemas/quiz.schema';
import { QuizAccessCodeService } from './services/quiz-access-code.service';
import { QuizAttemptStarterService } from './services/quiz-attempt-starter.service';
import { QuizAttemptSubmissionService } from './services/quiz-attempt-submission.service';
import { QuizCatalogService } from './services/quiz-catalog.service';
import { QuizLoadingService } from './services/quiz-loading.service';
import { QuizPreviewService } from './services/quiz-preview.service';
import { QuizTeacherLookupService } from './services/quiz-teacher-lookup.service';
import { QuizValidationService } from './services/quiz-validation.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Quiz.name, schema: QuizSchema },
      { name: QuizAttempt.name, schema: QuizAttemptSchema },
      { name: Question.name, schema: QuestionSchema },
      { name: Group.name, schema: GroupSchema },
    ]),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [
    QuizzesController,
    QuizAccessController,
    QuizAnalyticsController,
    QuizHistoryController,
    QuizPreviewController,
  ],
  providers: [
    QuizAccessCodeService,
    QuizLoadingService,
    QuizTeacherLookupService,
    QuizValidationService,
    QuizCatalogService,
    QuizAttemptStarterService,
    QuizAttemptSubmissionService,
    QuizPreviewService,
    QuizzesSharedService,
    QuizIndexesService,
    QuizzesService,
    QuizAccessService,
    QuizAnalyticsService,
  ],
  exports: [
    QuizAccessCodeService,
    QuizLoadingService,
    QuizTeacherLookupService,
    QuizValidationService,
    QuizCatalogService,
    QuizAttemptStarterService,
    QuizAttemptSubmissionService,
    QuizPreviewService,
    QuizzesSharedService,
    QuizIndexesService,
    QuizzesService,
    QuizAccessService,
    QuizAnalyticsService,
    MongooseModule,
  ],
})
export class QuizzesModule {}
