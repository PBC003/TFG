export type QuestionOption = {
  key: string;
  text: string;
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

export type ParametricQuestionVariable = {
  name: string;
  min: number;
  max: number;
  step?: number;
  precision?: number;
};

export type ParametricQuestionConfig = {
  variables: ParametricQuestionVariable[];
  answerFormula: string;
  tolerance?: number;
  sampleAnswer?: string;
};

export type QuestionTypeConfig =
  | TrueFalseQuestionConfig
  | SingleChoiceQuestionConfig
  | MultipleChoiceQuestionConfig
  | ParametricQuestionConfig;
