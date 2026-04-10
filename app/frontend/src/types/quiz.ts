import type { QuestionType } from "./question";

export type QuizStatus = "draft" | "published";
export type QuizAttemptStatus = "in_progress" | "submitted" | "expired";

export interface QuizQuestionItem {
  questionId: string;
  title: string;
  type: QuestionType;
  statement: string;
  tags: string[];
  points: number;
  order: number;
}

export interface QuizItem {
  quizId: string;
  title: string;
  description: string | null;
  accessCode: string | null;
  requiresAccessCode: boolean;
  status: QuizStatus;
  hasAttempts: boolean;
  canEdit: boolean;
  canDelete: boolean;
  attemptsAllowed: number;
  startAt: string | null;
  endAt: string | null;
  timeLimitMinutes: number | null;
  shuffleQuestions: boolean;
  revealAnswersAfterClose: boolean;
  publishedAt: string | null;
  totalQuestions: number;
  totalPoints: number;
  questions: QuizQuestionItem[];
  createdByUserId: number;
  updatedByUserId: number;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuizQuestionInput {
  questionId: string;
  points: number;
}

export interface CreateQuizInput {
  title: string;
  description?: string | null;
  accessCode?: string | null;
  requiresAccessCode: boolean;
  attemptsAllowed: number;
  startAt?: string | null;
  endAt?: string | null;
  timeLimitMinutes?: number | null;
  shuffleQuestions: boolean;
  revealAnswersAfterClose: boolean;
  questions: QuizQuestionInput[];
}

export interface UpdateQuizInput {
  title?: string;
  description?: string | null;
  accessCode?: string | null;
  requiresAccessCode?: boolean;
  attemptsAllowed?: number;
  startAt?: string | null;
  endAt?: string | null;
  timeLimitMinutes?: number | null;
  shuffleQuestions?: boolean;
  revealAnswersAfterClose?: boolean;
  questions?: QuizQuestionInput[];
}

export interface PublicChoiceOption {
  key: string;
  text: string;
}

export interface PublicQuizCatalogItem {
  quizId: string;
  title: string;
  description: string | null;
  teacherName: string;
  requiresAccessCode: boolean;
  attemptsAllowed: number;
  attemptsRemaining: number | null;
  totalQuestions: number;
  totalPoints: number;
  startAt: string | null;
  endAt: string | null;
  timeLimitMinutes: number | null;
  publishedAt: string | null;
  isAvailableNow: boolean;
  canStart: boolean;
}

export interface PublicAttemptQuestion {
  questionId: string;
  title: string;
  type: QuestionType;
  statement: string;
  explanation: string | null;
  tags: string[];
  points: number;
  order: number;
  questionConfig: Record<string, never> | { options: PublicChoiceOption[] };
}

export interface QuizAttemptItem {
  attemptId: string;
  quizId: string;
  title: string;
  description: string | null;
  accessCode: string | null;
  participantName: string;
  attemptNumber: number;
  attemptsAllowed: number;
  attemptsRemaining: number;
  status: QuizAttemptStatus;
  startedAt: string;
  expiresAt: string | null;
  questions: PublicAttemptQuestion[];
}

export interface QuizSubmissionQuestionReview {
  questionId: string;
  title: string;
  statement: string;
  type: QuestionType;
  points: number;
  earnedPoints: number;
  isCorrect: boolean;
  submittedValue: unknown;
  correctValue: unknown;
  explanation: string | null;
  feedback: string | null;
  availableOptions: PublicChoiceOption[] | null;
}

export interface QuizSubmissionResult {
  attemptId: string;
  quizId: string;
  title: string;
  participantName: string;
  attemptNumber: number;
  attemptsAllowed: number;
  attemptsRemaining: number;
  status: QuizAttemptStatus;
  submittedAt: string;
  earnedPoints: number;
  maxPoints: number;
  scoreOverTen: number;
  canRevealFeedback: boolean;
  revealBlockedByEndDate: boolean;
  review: QuizSubmissionQuestionReview[];
}

export type QuizAnswerValue = boolean | string | string[] | null;
