import type {
  QuestionItem,
  CreateQuestionInput,
  UpdateQuestionInput,
} from "../../../types/question";
import type { QuestionTypeFilter } from "../../../components/questions/QuestionsFiltersCard";

export type QuestionsPageFeedbackState = {
  severity: "success" | "error";
  message: string;
} | null;

export type QuestionsPageTableHeaders = {
  title: string;
  type: string;
  tags: string;
  version: string;
  updatedAt: string;
  actions: string;
};

export type QuestionsPageContentProps = {
  loading: boolean;
  isMobile: boolean;
  questions: QuestionItem[];
  locale: string;
  noneLabel: string;
  loadingLabel: string;
  emptyLabel: string;
  editLabel: string;
  deleteLabel: string;
  tableHeaders: QuestionsPageTableHeaders;
  lastUpdatedLabel: (value: string) => string;
  onEdit: (question: QuestionItem) => void;
  onDelete: (question: QuestionItem) => void;
};

export type UseQuestionsPageOptions = {
  t: (key: string, options?: Record<string, unknown>) => string;
};

export type UseQuestionsPageResult = {
  questions: QuestionItem[];
  visibleQuestions: QuestionItem[];
  loading: boolean;
  submitting: boolean;
  feedback: QuestionsPageFeedbackState;
  search: string;
  typeFilter: QuestionTypeFilter;
  editorOpen: boolean;
  editingQuestion: QuestionItem | null;
  deletingQuestion: QuestionItem | null;
  setSearch: (value: string) => void;
  setTypeFilter: (value: QuestionTypeFilter) => void;
  clearFeedback: () => void;
  openCreateDialog: () => void;
  openEditDialog: (question: QuestionItem) => void;
  closeEditor: () => void;
  submitEditor: (
    payload: CreateQuestionInput | UpdateQuestionInput,
  ) => Promise<void>;
  openDeleteDialog: (question: QuestionItem) => void;
  closeDeleteDialog: () => void;
  confirmDelete: () => Promise<void>;
  refreshQuestions: (successMessage?: string) => Promise<void>;
};
