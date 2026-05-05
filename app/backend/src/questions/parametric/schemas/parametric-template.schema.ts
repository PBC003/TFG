import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ParametricQuestionTemplateId } from '../../types/question-type-config.type';

export type ParametricTemplateDocument = HydratedDocument<ParametricTemplate>;

@Schema({ _id: false, versionKey: false })
export class ParametricTemplateVariant {
  @Prop({ type: Number, required: true, min: 1 })
  variantKey!: number;

  @Prop({ type: String, required: true, trim: true })
  statement!: string;

  @Prop({ type: Number, required: true })
  correctAnswerNumeric!: number;

  @Prop({ type: String, required: true, trim: true })
  correctAnswerLatex!: string;

  @Prop({ type: Object, default: {} })
  generatedValues!: Record<string, number>;
}

export const ParametricTemplateVariantSchema = SchemaFactory.createForClass(
  ParametricTemplateVariant,
);

@Schema({
  collection: 'parametric_templates',
  versionKey: false,
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
})
export class ParametricTemplate {
  @Prop({
    type: String,
    required: true,
    enum: ParametricQuestionTemplateId,
    unique: true,
    trim: true,
  })
  templateId!: ParametricQuestionTemplateId;

  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 120,
  })
  name!: string;

  @Prop({ type: String, required: true, trim: true })
  canonicalStatement!: string;

  @Prop({ type: Number, required: true, min: 0, default: 0.01 })
  defaultTolerance!: number;

  @Prop({ type: String, trim: true, default: null })
  inputPlaceholder!: string | null;

  @Prop({ type: [ParametricTemplateVariantSchema], default: [] })
  variants!: ParametricTemplateVariant[];

  @Prop({ type: String, trim: true, default: null })
  sourceSeedBundle!: string | null;

  createdAt!: Date;
  updatedAt!: Date;
}

export const ParametricTemplateSchema =
  SchemaFactory.createForClass(ParametricTemplate);

ParametricTemplateSchema.index({ templateId: 1 }, { unique: true });
ParametricTemplateSchema.index({ sourceSeedBundle: 1 });
