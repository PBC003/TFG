import { QuestionType } from '../../questions/enums/question-type.enum';
import type {
  MultipleChoiceQuestionConfig,
  ParametricQuestionConfig,
  SingleChoiceQuestionConfig,
  TrueFalseQuestionConfig,
} from '../../questions/types/question-type-config.type';
import { QuizAttemptStatus } from '../enums/quiz-attempt-status.enum';
import { QuizStatus } from '../enums/quiz-status.enum';

export type QuizQuestionItem = {
  questionId: string;
  title: string;
  type: QuestionType;
  statement: string;
  tags: string[];
  points: number;
  order: number;
  quantity?: number;
  toleranceOverride?: number | null;
};

export type QuizGroupSummary = {
  groupId: string;
  name: string;
};

export type QuizItem = {
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
  startAt: Date | null;
  endAt: Date | null;
  timeLimitMinutes: number | null;
  shuffleQuestions: boolean;
  revealAnswersAfterClose: boolean;
  publishedAt: Date | null;
  audienceScope: 'all' | 'groups';
  totalQuestions: number;
  totalPoints: number;
  questions: QuizQuestionItem[];
  assignedGroupIds: string[];
  assignedGroups: QuizGroupSummary[];
  createdByUserId: number;
  updatedByUserId: number;
  version: number;
  createdAt: Date;
  updatedAt: Date;
};

export type PublicQuizCatalogItem = {
  quizId: string;
  title: string;
  description: string | null;
  teacherName: string;
  requiresAccessCode: boolean;
  attemptsAllowed: number;
  attemptsRemaining: number | null;
  totalQuestions: number;
  totalPoints: number;
  startAt: Date | null;
  endAt: Date | null;
  timeLimitMinutes: number | null;
  publishedAt: Date | null;
  audienceScope: 'all' | 'groups';
  isAvailableNow: boolean;
  canStart: boolean;
};

export type PublicTrueFalseQuestionConfig = Record<string, never>;

export type PublicChoiceQuestionOption = {
  key: string;
  text: string;
};

export type PublicSingleChoiceQuestionConfig = {
  options: PublicChoiceQuestionOption[];
};

export type PublicMultipleChoiceQuestionConfig = {
  options: PublicChoiceQuestionOption[];
};

export type PublicParametricQuestionConfig = {
  tolerance: number;
  inputPlaceholder: string;
};

export type PublicQuestionConfig =
  | PublicTrueFalseQuestionConfig
  | PublicSingleChoiceQuestionConfig
  | PublicMultipleChoiceQuestionConfig
  | PublicParametricQuestionConfig;

export type PublicAttemptQuestion = QuizQuestionItem & {
  explanation: string | null;
  questionConfig: PublicQuestionConfig;
};

export type QuizAttemptItem = {
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
  startedAt: Date;
  expiresAt: Date | null;
  questions: PublicAttemptQuestion[];
};

export type QuizSubmissionQuestionReview = {
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
  availableOptions: PublicChoiceQuestionOption[] | null;
};

export type QuizSubmissionResult = {
  isPreview?: boolean;
  attemptId: string;
  quizId: string;
  title: string;
  participantName: string;
  attemptNumber: number;
  attemptsAllowed: number;
  attemptsRemaining: number;
  status: QuizAttemptStatus;
  submittedAt: Date;
  earnedPoints: number;
  maxPoints: number;
  scoreOverTen: number;
  canRevealFeedback: boolean;
  revealBlockedByEndDate: boolean;
  review: QuizSubmissionQuestionReview[];
};

export type QuizAnalyticsScoreBucket = {
  label: string;
  minScore: number;
  maxScore: number;
  count: number;
};

export type QuizAnalyticsSummary = {
  totalAttempts: number;
  completedAttempts: number;
  submittedAttempts: number;
  expiredAttempts: number;
  inProgressAttempts: number;
  uniqueParticipants: number;
  averageScoreOverTen: number;
  bestScoreOverTen: number;
  worstScoreOverTen: number;
};

export type QuizAnalyticsAttemptItem = {
  attemptId: string;
  quizId: string;
  participantName: string;
  participantDisplayName: string;
  attemptNumber: number;
  status: QuizAttemptStatus;
  startedAt: Date;
  submittedAt: Date | null;
  expiresAt: Date | null;
  earnedPoints: number;
  maxPoints: number;
  scoreOverTen: number;
  questionCount: number;
};

export type QuizAnalyticsQuestionStatsItem = {
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
};

export type QuizAnalyticsItem = {
  quizId: string;
  title: string;
  description: string | null;
  status: QuizStatus;
  hasAttempts: boolean;
  generatedAt: Date;
  summary: QuizAnalyticsSummary;
  scoreDistribution: QuizAnalyticsScoreBucket[];
  attempts: QuizAnalyticsAttemptItem[];
  questionStats: QuizAnalyticsQuestionStatsItem[];
};

export type QuizAttemptReviewDetail = {
  attemptId: string;
  quizId: string;
  title: string;
  participantName: string;
  participantDisplayName: string;
  attemptNumber: number;
  status: QuizAttemptStatus;
  startedAt: Date;
  submittedAt: Date | null;
  expiresAt: Date | null;
  earnedPoints: number;
  maxPoints: number;
  scoreOverTen: number;
  review: QuizSubmissionQuestionReview[];
};

export type QuizHistoryItem = {
  attemptId: string;
  quizId: string;
  quizTitle: string;
  quizDescription: string | null;
  status: QuizAttemptStatus;
  attemptNumber: number;
  startedAt: Date;
  submittedAt: Date | null;
  earnedPoints: number;
  maxPoints: number;
  scoreOverTen: number;
  totalQuestions: number;
};

export type SupportedQuestionConfig =
  | TrueFalseQuestionConfig
  | SingleChoiceQuestionConfig
  | MultipleChoiceQuestionConfig
  | ParametricQuestionConfig;

export type ParametricAttemptQuestionConfig = {
  templateId: ParametricQuestionConfig['templateId'];
  tolerance: number;
  generatedValues: Record<string, number>;
  correctAnswerNumeric: number;
  correctAnswerLatex: string;
  inputPlaceholder: string;
};
