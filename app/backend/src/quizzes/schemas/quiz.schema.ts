import { randomUUID } from 'crypto';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { QuizStatus } from '../enums/quiz-status.enum';

export type QuizDocument = HydratedDocument<Quiz>;

@Schema({ _id: false, versionKey: false })
export class QuizQuestionRef {
  @Prop({ required: true, trim: true })
  questionId!: string;

  @Prop({ required: true, min: 0 })
  points!: number;
}

export const QuizQuestionRefSchema =
  SchemaFactory.createForClass(QuizQuestionRef);

@Schema({
  collection: 'quizzes',
  versionKey: false,
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
})
export class Quiz {
  @Prop({
    required: true,
    unique: true,
    trim: true,
    default: () => randomUUID(),
  })
  quizId!: string;

  @Prop({ required: true, trim: true, minlength: 3, maxlength: 120 })
  title!: string;

  @Prop({ type: String, trim: true, default: null })
  description!: string | null;

  @Prop({
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: 16,
    index: true,
  })
  accessCode!: string;

  @Prop({ type: Boolean, default: false })
  requiresAccessCode!: boolean;

  @Prop({ type: String, required: true, enum: QuizStatus, index: true })
  status!: QuizStatus;

  @Prop({ type: Number, required: true, min: 1, max: 10 })
  attemptsAllowed!: number;

  @Prop({ type: Date, default: null })
  startAt!: Date | null;

  @Prop({ type: Date, default: null })
  endAt!: Date | null;

  @Prop({ type: Number, default: null, min: 1, max: 300 })
  timeLimitMinutes!: number | null;

  @Prop({ type: Boolean, default: false })
  shuffleQuestions!: boolean;

  @Prop({ type: Boolean, default: false })
  revealAnswersAfterClose!: boolean;

  @Prop({ type: [QuizQuestionRefSchema], default: [] })
  questions!: QuizQuestionRef[];

  @Prop({ type: Number, required: true, index: true })
  createdByUserId!: number;

  @Prop({ type: Number, required: true })
  updatedByUserId!: number;

  @Prop({ type: Number, default: 1 })
  version!: number;

  @Prop({ type: Date, default: null })
  publishedAt!: Date | null;

  createdAt!: Date;
  updatedAt!: Date;
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);

QuizSchema.index({ createdByUserId: 1, status: 1 });
QuizSchema.index({ status: 1, accessCode: 1 });
