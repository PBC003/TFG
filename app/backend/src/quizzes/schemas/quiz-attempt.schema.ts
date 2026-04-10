import { randomUUID } from 'crypto';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';
import { QuizAttemptStatus } from '../enums/quiz-attempt-status.enum';
import { QuestionType } from '../../questions/enums/question-type.enum';

export type QuizAttemptDocument = HydratedDocument<QuizAttempt>;

@Schema({ _id: false, versionKey: false })
export class QuizAttemptQuestionSnapshot {
  @Prop({ required: true, trim: true })
  questionId!: string;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ type: String, required: true, enum: QuestionType })
  type!: QuestionType;

  @Prop({ required: true, trim: true })
  statement!: string;

  @Prop({ type: String, trim: true, default: null })
  explanation!: string | null;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ required: true, min: 0 })
  points!: number;

  @Prop({ required: true, min: 0 })
  order!: number;

  @Prop({ type: SchemaTypes.Mixed, required: true })
  questionConfig!: unknown;
}

export const QuizAttemptQuestionSnapshotSchema = SchemaFactory.createForClass(
  QuizAttemptQuestionSnapshot,
);

@Schema({ _id: false, versionKey: false })
export class QuizAttemptAnswer {
  @Prop({ required: true, trim: true })
  questionId!: string;

  @Prop({ type: SchemaTypes.Mixed, default: null })
  value!: unknown;

  @Prop({ required: true, default: false })
  isCorrect!: boolean;

  @Prop({ required: true, min: 0 })
  earnedPoints!: number;

  @Prop({ required: true, min: 0 })
  maxPoints!: number;

  @Prop({ type: Date, default: null })
  answeredAt!: Date | null;
}

export const QuizAttemptAnswerSchema =
  SchemaFactory.createForClass(QuizAttemptAnswer);

@Schema({
  collection: 'quiz_attempts',
  versionKey: false,
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
})
export class QuizAttempt {
  @Prop({
    required: true,
    unique: true,
    trim: true,
    default: () => randomUUID(),
  })
  attemptId!: string;

  @Prop({ required: true, trim: true, index: true })
  quizId!: string;

  @Prop({
    type: String,
    trim: true,
    uppercase: true,
    index: true,
    default: null,
  })
  accessCode!: string | null;

  @Prop({ required: true, trim: true, index: true })
  participantName!: string;

  @Prop({ required: true, min: 1 })
  attemptNumber!: number;

  @Prop({ type: String, required: true, enum: QuizAttemptStatus, index: true })
  status!: QuizAttemptStatus;

  @Prop({ required: true })
  startedAt!: Date;

  @Prop({ type: Date, default: null })
  submittedAt!: Date | null;

  @Prop({ type: Date, default: null })
  expiresAt!: Date | null;

  @Prop({ required: true, min: 0 })
  maxPoints!: number;

  @Prop({ required: true, min: 0, default: 0 })
  earnedPoints!: number;

  @Prop({ type: [QuizAttemptQuestionSnapshotSchema], default: [] })
  questions!: QuizAttemptQuestionSnapshot[];

  @Prop({ type: [QuizAttemptAnswerSchema], default: [] })
  answers!: QuizAttemptAnswer[];

  createdAt!: Date;
  updatedAt!: Date;
}

export const QuizAttemptSchema = SchemaFactory.createForClass(QuizAttempt);

QuizAttemptSchema.index({ quizId: 1, participantName: 1, startedAt: -1 });
QuizAttemptSchema.index({ attemptId: 1, status: 1 });
