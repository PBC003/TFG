import type { AlertColor } from "@mui/material";
import type { QuestionItem } from "../../../types/question";
import type {
  CreateQuizInput,
  QuizItem,
  UpdateQuizInput,
} from "../../../types/quiz";

export type QuizzesPageFeedback = {
  severity: AlertColor;
  message: string;
} | null;

export interface UseQuizzesPageResult {
  quizzes: QuizItem[];
  visibleQuizzes: QuizItem[];
  paginatedQuizzes: QuizItem[];
  questionBank: QuestionItem[];
  loading: boolean;
  questionBankLoading: boolean;
  submitting: boolean;
  feedback: QuizzesPageFeedback;
  search: string;
  statusFilter: "all" | "draft" | "published";
  editorOpen: boolean;
  editingQuiz: QuizItem | null;
  page: number;
  rowsPerPage: number;
  setSearch: (value: string) => void;
  setStatusFilter: (value: "all" | "draft" | "published") => void;
  setPage: (value: number) => void;
  setRowsPerPage: (value: number) => void;
  clearFeedback: () => void;
  openCreateDialog: () => void;
  openEditDialog: (quiz: QuizItem) => void;
  closeEditor: () => void;
  submitEditor: (payload: CreateQuizInput | UpdateQuizInput) => Promise<void>;
  togglePublishStatus: (quiz: QuizItem) => Promise<void>;
  copyAccessLink: (quiz: QuizItem) => Promise<void>;
  deleteQuiz: (quiz: QuizItem) => Promise<void>;
  refreshQuizzes: (successMessage?: string) => Promise<void>;
}
