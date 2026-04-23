import type { GroupItem } from "../../../../types/group";
import type { QuestionItem, QuestionType } from "../../../../types/question";
import type {
  CreateQuizInput,
  QuizItem,
  UpdateQuizInput,
} from "../../../../types/quiz";

export interface QuizEditorDialogProps {
  open: boolean;
  quiz: QuizItem | null;
  questionBank: QuestionItem[];
  groupOptions?: GroupItem[];
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
    accessCodePlaceholder?: string;
    accessCodeHelp: string;
    accessCodeOptional?: string;
    accessCodeAuto?: string;
    attemptsAllowed: string;
    startAt: string;
    endAt: string;
    timeLimitMinutes: string;
    shuffleQuestions: string;
    revealAnswersAfterClose: string;
    assignedGroups?: string;
    assignedGroupsHelper?: string;
    selectedQuestionsFirst: string;
    selectedQuestionsCount: string;
    questionPaginationLabel: string;
    startAtHelper: string;
    endAtHelper: string;
    invalidDateRange: string;
    invalidEndDateInPast: string;
    parametricQuantity?: string;
    parametricToleranceOverride?: string;
    parametricQuantityHelper?: string;
    parametricToleranceOverrideHelper?: string;
  };
  onClose: () => void;
  onSubmit: (payload: CreateQuizInput | UpdateQuizInput) => Promise<void>;
}

export type SelectedQuestionState = {
  questionId: string;
  type?: QuestionType;
  points: number;
  quantity?: number;
  toleranceOverride?: string;
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
  selectedGroupIds: string[];
};
