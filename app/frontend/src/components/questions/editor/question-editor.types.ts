import type {
  ParametricQuestionTemplateId,
  QuestionType,
} from "../../../types/question";

export type EditableOption = {
  key: string;
  text: string;
  feedback: string;
  isCorrect: boolean;
};

export type FormState = {
  title: string;
  type: QuestionType;
  statement: string;
  explanation: string;
  tags: string[];
  newTag: string;
  trueFalse: {
    correctAnswer: boolean;
    feedbackForTrue: string;
    feedbackForFalse: string;
  };
  singleChoice: {
    options: EditableOption[];
    randomizeOptions: boolean;
  };
  multipleChoice: {
    options: EditableOption[];
    randomizeOptions: boolean;
    gradingMode: "all_or_nothing" | "partial_credit";
  };
  parametric: {
    templateId: ParametricQuestionTemplateId;
    sampleSeed: number;
  };
};

export type PreviewState = Record<string, boolean>;
