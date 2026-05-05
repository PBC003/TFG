import type { ParametricQuestionTemplateId, QuestionType } from "./question";

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
  quantity?: number;
  toleranceOverride?: number | null;
}

export interface QuizGroupSummary {
  groupId: string;
  name: string;
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
  audienceScope: "all" | "groups";
  totalQuestions: number;
  totalPoints: number;
  questions: QuizQuestionItem[];
  assignedGroupIds: string[];
  assignedGroups: QuizGroupSummary[];
  createdByUserId: number;
  updatedByUserId: number;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuizQuestionInput {
  questionId: string;
  points: number;
  quantity?: number;
  toleranceOverride?: number | null;
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
  assignedGroupIds?: string[];
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
  assignedGroupIds?: string[];
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
  audienceScope: "all" | "groups";
  isAvailableNow: boolean;
  canStart: boolean;
}

export interface PublicParametricQuestionConfig {
  tolerance: number;
  inputPlaceholder: string;
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
  questionConfig:
    | Record<string, never>
    | { options: PublicChoiceOption[] }
    | PublicParametricQuestionConfig;
}

export interface QuizAttemptItem {
  isPreview?: boolean;
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
  isPreview?: boolean;
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

export interface QuizAnalyticsScoreBucket {
  label: string;
  minScore: number;
  maxScore: number;
  count: number;
}

export interface QuizAnalyticsSummary {
  totalAttempts: number;
  completedAttempts: number;
  submittedAttempts: number;
  expiredAttempts: number;
  inProgressAttempts: number;
  uniqueParticipants: number;
  averageScoreOverTen: number;
  bestScoreOverTen: number;
  worstScoreOverTen: number;
}

export interface QuizAnalyticsAttemptItem {
  attemptId: string;
  quizId: string;
  participantName: string;
  participantDisplayName: string;
  attemptNumber: number;
  status: QuizAttemptStatus;
  startedAt: string;
  submittedAt: string | null;
  expiresAt: string | null;
  earnedPoints: number;
  maxPoints: number;
  scoreOverTen: number;
  questionCount: number;
}

export interface QuizAnalyticsQuestionStatsItem {
  questionId: string;
  title: string;
  type: QuestionType;
  order: number;
  maxPoints: number;
  attempts: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  averageEarnedPoints: number;
  correctRate: number;
}

export interface QuizAnalyticsItem {
  quizId: string;
  title: string;
  description: string | null;
  status: QuizStatus;
  hasAttempts: boolean;
  generatedAt: string;
  summary: QuizAnalyticsSummary;
  scoreDistribution: QuizAnalyticsScoreBucket[];
  attempts: QuizAnalyticsAttemptItem[];
  questionStats: QuizAnalyticsQuestionStatsItem[];
}

export interface QuizAttemptReviewDetail {
  attemptId: string;
  quizId: string;
  title: string;
  participantName: string;
  participantDisplayName: string;
  attemptNumber: number;
  status: QuizAttemptStatus;
  startedAt: string;
  submittedAt: string | null;
  expiresAt: string | null;
  earnedPoints: number;
  maxPoints: number;
  scoreOverTen: number;
  review: QuizSubmissionQuestionReview[];
}

export interface QuizHistoryItem {
  attemptId: string;
  quizId: string;
  quizTitle: string;
  quizDescription: string | null;
  status: QuizAttemptStatus;
  attemptNumber: number;
  startedAt: string;
  submittedAt: string | null;
  earnedPoints: number;
  maxPoints: number;
  scoreOverTen: number;
  totalQuestions: number;
}

export type QuizAnswerValue = boolean | string | string[] | null | undefined;

export type ParametricPreviewItem = {
  templateId: ParametricQuestionTemplateId;
  statement: string;
  correctAnswerLatex: string;
  generatedValues: Record<string, number>;
  tolerance: number;
};
