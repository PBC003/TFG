export type QuestionOption = {
  key: string;
  text: string;
  feedback?: string | null;
};

export type TrueFalseQuestionConfig = {
  correctAnswer: boolean;
};

export type SingleChoiceQuestionConfig = {
  options: QuestionOption[];
  correctOptionKey: string;
  randomizeOptions?: boolean;
};

export type MultipleChoiceQuestionConfig = {
  options: QuestionOption[];
  correctOptionKeys: string[];
  randomizeOptions?: boolean;
  gradingMode?: 'all_or_nothing' | 'partial_credit';
};

export enum ParametricQuestionTemplateId {
  LIMIT_TRIGONOMETRIC = 'limit_trigonometric',
  LIMIT_LOGARITHMIC = 'limit_logarithmic',
  INTEGRAL_LOGARITHMIC = 'integral_logarithmic',
  INTEGRAL_INVERSE_QUADRATIC = 'integral_inverse_quadratic',
  SERIES_GEOMETRIC = 'series_geometric',
}

export type ParametricQuestionConfig = {
  templateId: ParametricQuestionTemplateId;
  tolerance?: number;
};

export type QuestionTypeConfig =
  | TrueFalseQuestionConfig
  | SingleChoiceQuestionConfig
  | MultipleChoiceQuestionConfig
  | ParametricQuestionConfig;
