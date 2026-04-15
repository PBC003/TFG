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
  totalQuestions: number;
  totalPoints: number;
  questions: QuizQuestionItem[];
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
