import { ParametricQuestionTemplateId } from '../../types/question-type-config.type';

export type ParametricTemplateVariantDefinition = {
  variantKey: number;
  statement: string;
  correctAnswerNumeric: number;
  correctAnswerLatex: string;
  generatedValues: Record<string, number>;
};

export type ParametricTemplateDefinition = {
  templateId: ParametricQuestionTemplateId;
  name: string;
  canonicalStatement: string;
  defaultTolerance?: number;
  inputPlaceholder?: string | null;
  variants: ParametricTemplateVariantDefinition[];
};
