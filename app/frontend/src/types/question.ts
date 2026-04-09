export type QuestionType =
  | "true_false"
  | "single_choice"
  | "multiple_choice"
  | "parametric";

export interface QuestionOption {
  key: string;
  text: string;
  feedback?: string | null;
}

export interface TrueFalseQuestionConfig {
  correctAnswer: boolean;
  feedbackForTrue?: string | null;
  feedbackForFalse?: string | null;
}

export interface SingleChoiceQuestionConfig {
  options: QuestionOption[];
  correctOptionKey: string;
  randomizeOptions?: boolean;
}

export interface MultipleChoiceQuestionConfig {
  options: QuestionOption[];
  correctOptionKeys: string[];
  randomizeOptions?: boolean;
  gradingMode?: "all_or_nothing" | "partial_credit";
}

export interface ParametricQuestionVariable {
  name: string;
  min: number;
  max: number;
  step?: number;
  precision?: number;
}

export interface ParametricQuestionConfig {
  variables: ParametricQuestionVariable[];
  answerFormula: string;
  tolerance?: number;
  sampleAnswer?: string;
}

export type QuestionTypeConfig =
  | TrueFalseQuestionConfig
  | SingleChoiceQuestionConfig
  | MultipleChoiceQuestionConfig
  | ParametricQuestionConfig;

export interface QuestionItem {
  questionId: string;
  title: string;
  type: QuestionType;
  statement: string;
  explanation: string | null;
  tags: string[];
  createdByUserId: number;
  updatedByUserId: number;
  version: number;
  questionConfig: QuestionTypeConfig;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuestionInput {
  title: string;
  type: QuestionType;
  statement: string;
  explanation?: string | null;
  tags?: string[];
  questionConfig: QuestionTypeConfig;
}

export interface UpdateQuestionInput {
  title?: string;
  type?: QuestionType;
  statement?: string;
  explanation?: string | null;
  tags?: string[];
  questionConfig?: QuestionTypeConfig;
}
