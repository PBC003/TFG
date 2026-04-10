import type { AlertColor } from "@mui/material";
import type {
  PublicQuizCatalogItem,
  QuizAnswerValue,
  QuizAttemptItem,
  QuizSubmissionResult,
} from "../../../types/quiz";

export type QuizAccessFeedback = {
  severity: AlertColor;
  message: string;
} | null;

export type StartAttemptOptions = {
  quizId?: string;
  accessCode?: string | null;
};

export type QuizAccessAnswerMap = Record<string, QuizAnswerValue>;

export interface UseQuizAccessPageResult {
  accessCode: string;
  catalogSearch: string;
  starting: boolean;
  submitting: boolean;
  reviewLoading: boolean;
  catalogLoading: boolean;
  feedback: QuizAccessFeedback;
  activeAttempt: QuizAttemptItem | null;
  answers: QuizAccessAnswerMap;
  result: QuizSubmissionResult | null;
  publicQuizzes: PublicQuizCatalogItem[];
  catalogPage: number;
  catalogRowsPerPage: number;
  nowMs: number;
  selectedQuiz: PublicQuizCatalogItem | null;
  filteredCatalog: PublicQuizCatalogItem[];
  paginatedCatalog: PublicQuizCatalogItem[];
  questionCount: number;
  selectedQuizStartDisabled: boolean;
  canRequestBestResult: boolean;
  setAccessCode: (value: string) => void;
  setCatalogSearch: (value: string) => void;
  setCatalogPage: (page: number) => void;
  setCatalogRowsPerPage: (rowsPerPage: number) => void;
  setFeedback: (feedback: QuizAccessFeedback) => void;
  updateAnswer: (questionId: string, value: QuizAnswerValue) => void;
  refreshCatalog: () => Promise<void>;
  handleStartAttempt: (options?: StartAttemptOptions) => Promise<void>;
  handleSubmitAttempt: () => Promise<void>;
  handleLoadBestResult: (quizId?: string) => Promise<void>;
  resetLookup: () => void;
}
