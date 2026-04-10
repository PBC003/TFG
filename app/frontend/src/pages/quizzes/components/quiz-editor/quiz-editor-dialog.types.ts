import type { QuestionItem } from "../../../../types/question";
import type {
  CreateQuizInput,
  QuizItem,
  UpdateQuizInput,
} from "../../../../types/quiz";

export interface QuizEditorDialogProps {
  open: boolean;
  quiz: QuizItem | null;
  questionBank: QuestionItem[];
  questionBankLoading?: boolean;
  submitting: boolean;
  title: string;
  description: string;
  cancelLabel: string;
  saveLabel: string;
  searchPlaceholder: string;
  unsupportedTypeLabel: string;
  questionsSectionTitle: string;
  questionPointsLabel: string;
  noQuestionsLabel: string;
  validationMessage: string | null;
  fields: {
    title: string;
    description: string;
    accessCode: string;
    accessCodePlaceholder: string;
    accessCodeHelp: string;
    attemptsAllowed: string;
    startAt: string;
    endAt: string;
    timeLimitMinutes: string;
    shuffleQuestions: string;
    revealAnswersAfterClose: string;
    selectedQuestionsFirst: string;
    selectedQuestionsCount: string;
    questionPaginationLabel: string;
    startAtHelper: string;
    endAtHelper: string;
    invalidDateRange: string;
    invalidEndDateInPast: string;
  };
  onClose: () => void;
  onSubmit: (payload: CreateQuizInput | UpdateQuizInput) => Promise<void>;
}

export type SelectedQuestionState = {
  questionId: string;
  points: number;
};

export type QuizEditorInitialState = {
  quizTitle: string;
  quizDescription: string;
  accessCode: string;
  attemptsAllowed: string;
  startAt: string;
  endAt: string;
  timeLimitMinutes: string;
  shuffleQuestions: boolean;
  revealAnswersAfterClose: boolean;
  selectedQuestions: SelectedQuestionState[];
};
