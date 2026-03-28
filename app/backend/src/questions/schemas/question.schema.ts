import { randomUUID } from 'crypto';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';
import { QuestionType } from '../enums/question-type.enum';
import type { QuestionTypeConfig } from '../types/question-type-config.type';
import { isValidQuestionTypeConfig } from '../validators/question-type-config.validator';

export type QuestionDocument = HydratedDocument<Question>;

@Schema({
  collection: 'questions',
  versionKey: false,
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
})
export class Question {
  @Prop({
    required: true,
    unique: true,
    trim: true,
    default: () => randomUUID(),
  })
  questionId!: string;

  @Prop({ required: true, trim: true, minlength: 3, maxlength: 120 })
  title!: string;

  @Prop({ type: String, required: true, enum: QuestionType, index: true })
  type!: QuestionType;

  @Prop({ required: true, trim: true })
  statement!: string;

  @Prop({ type: String, trim: true, required: false, default: null })
  explanation!: string | null;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ type: Number, required: true, index: true })
  createdByUserId!: number;

  @Prop({ type: Number, required: true })
  updatedByUserId!: number;

  @Prop({ type: Number, default: 1 })
  version!: number;

  @Prop({
    type: SchemaTypes.Mixed,
    required: true,
    validate: {
      validator(this: Question, value: unknown): boolean {
        return isValidQuestionTypeConfig(this.type, value);
      },
      message: 'questionConfig does not match the selected question type',
    },
  })
  questionConfig!: QuestionTypeConfig;

  createdAt!: Date;
  updatedAt!: Date;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);

QuestionSchema.index({ createdByUserId: 1, type: 1 });
QuestionSchema.index({ tags: 1 });
