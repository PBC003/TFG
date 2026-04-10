import { QuestionType } from '../../questions/enums/question-type.enum';
import type {
  MultipleChoiceQuestionConfig,
  QuestionOption,
  SingleChoiceQuestionConfig,
  TrueFalseQuestionConfig,
} from '../../questions/types/question-type-config.type';
import type {
  QuizAttemptQuestionSnapshot,
  QuizAttemptAnswer,
} from '../schemas/quiz-attempt.schema';
import type { QuizSubmissionQuestionReview } from '../types/quiz.types';

export type SubmittedAnswerMap = Map<string, unknown>;

export type GradedAttempt = {
  answers: QuizAttemptAnswer[];
  review: QuizSubmissionQuestionReview[];
  earnedPoints: number;
  maxPoints: number;
};

function coerceStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value.filter(
        (item): item is string =>
          typeof item === 'string' && item.trim().length > 0,
      ),
    ),
  );
}

function findOptionFeedback(
  options: QuestionOption[],
  optionKey: string | null,
): string | null {
  if (!optionKey) {
    return null;
  }

  const option = options.find((candidate) => candidate.key === optionKey) as
    | (QuestionOption & { feedback?: string | null })
    | undefined;

  return option?.feedback?.trim() || null;
}

function findMultipleFeedback(
  options: QuestionOption[],
  optionKeys: string[],
): string | null {
  const feedbackBlocks = optionKeys
    .map((optionKey) => findOptionFeedback(options, optionKey))
    .filter((value): value is string => Boolean(value));

  if (feedbackBlocks.length === 0) {
    return null;
  }

  return feedbackBlocks.join('\n');
}

function gradeTrueFalse(
  snapshot: QuizAttemptQuestionSnapshot,
  value: unknown,
): Omit<
  QuizSubmissionQuestionReview,
  'questionId' | 'title' | 'statement' | 'type' | 'availableOptions'
> & {
  answer: QuizAttemptAnswer;
} {
  const questionConfig = snapshot.questionConfig as TrueFalseQuestionConfig & {
    feedbackForTrue?: string | null;
    feedbackForFalse?: string | null;
  };
  const submittedValue = typeof value === 'boolean' ? value : null;
  const isCorrect = submittedValue === questionConfig.correctAnswer;
  const earnedPoints = isCorrect ? snapshot.points : 0;
  const feedback =
    submittedValue === true
      ? questionConfig.feedbackForTrue?.trim() || snapshot.explanation
      : submittedValue === false
        ? questionConfig.feedbackForFalse?.trim() || snapshot.explanation
        : snapshot.explanation;

  return {
    answer: {
      questionId: snapshot.questionId,
      value: submittedValue,
      isCorrect,
      earnedPoints,
      maxPoints: snapshot.points,
      answeredAt: submittedValue === null ? null : new Date(),
    },
    points: snapshot.points,
    earnedPoints,
    isCorrect,
    submittedValue,
    correctValue: questionConfig.correctAnswer,
    explanation: snapshot.explanation,
    feedback,
  };
}

function gradeSingleChoice(
  snapshot: QuizAttemptQuestionSnapshot,
  value: unknown,
): Omit<
  QuizSubmissionQuestionReview,
  'questionId' | 'title' | 'statement' | 'type' | 'availableOptions'
> & {
  answer: QuizAttemptAnswer;
} {
  const questionConfig = snapshot.questionConfig as SingleChoiceQuestionConfig;
  const submittedValue = typeof value === 'string' ? value : null;
  const isCorrect = submittedValue === questionConfig.correctOptionKey;
  const earnedPoints = isCorrect ? snapshot.points : 0;
  const feedback =
    findOptionFeedback(questionConfig.options, submittedValue) ??
    snapshot.explanation;

  return {
    answer: {
      questionId: snapshot.questionId,
      value: submittedValue,
      isCorrect,
      earnedPoints,
      maxPoints: snapshot.points,
      answeredAt: submittedValue === null ? null : new Date(),
    },
    points: snapshot.points,
    earnedPoints,
    isCorrect,
    submittedValue,
    correctValue: questionConfig.correctOptionKey,
    explanation: snapshot.explanation,
    feedback,
  };
}

function gradeMultipleChoice(
  snapshot: QuizAttemptQuestionSnapshot,
  value: unknown,
): Omit<
  QuizSubmissionQuestionReview,
  'questionId' | 'title' | 'statement' | 'type' | 'availableOptions'
> & {
  answer: QuizAttemptAnswer;
} {
  const questionConfig =
    snapshot.questionConfig as MultipleChoiceQuestionConfig;
  const submittedValue = coerceStringArray(value);
  const correctKeys = Array.from(new Set(questionConfig.correctOptionKeys));
  const submittedSet = new Set(submittedValue);
  const correctSet = new Set(correctKeys);
  const incorrectSelections = submittedValue.filter(
    (key) => !correctSet.has(key),
  );
  const correctSelections = submittedValue.filter((key) => correctSet.has(key));

  let earnedPoints = 0;
  let isCorrect = false;

  if ((questionConfig.gradingMode ?? 'all_or_nothing') === 'partial_credit') {
    const rawRatio =
      correctKeys.length === 0
        ? 0
        : (correctSelections.length - incorrectSelections.length) /
          correctKeys.length;
    const safeRatio = Math.max(0, Math.min(1, rawRatio));
    earnedPoints = Number((snapshot.points * safeRatio).toFixed(2));
    isCorrect = safeRatio === 1;
  } else {
    isCorrect =
      submittedSet.size === correctSet.size &&
      correctKeys.every((key) => submittedSet.has(key));
    earnedPoints = isCorrect ? snapshot.points : 0;
  }

  const feedback =
    findMultipleFeedback(questionConfig.options, submittedValue) ??
    snapshot.explanation;

  return {
    answer: {
      questionId: snapshot.questionId,
      value: submittedValue,
      isCorrect,
      earnedPoints,
      maxPoints: snapshot.points,
      answeredAt: submittedValue.length === 0 ? null : new Date(),
    },
    points: snapshot.points,
    earnedPoints,
    isCorrect,
    submittedValue,
    correctValue: correctKeys,
    explanation: snapshot.explanation,
    feedback,
  };
}

export function gradeAttempt(
  snapshots: QuizAttemptQuestionSnapshot[],
  submittedAnswers: SubmittedAnswerMap,
): GradedAttempt {
  const answers: QuizAttemptAnswer[] = [];
  const review: QuizSubmissionQuestionReview[] = [];
  let earnedPoints = 0;
  let maxPoints = 0;

  for (const snapshot of [...snapshots].sort(
    (left, right) => left.order - right.order,
  )) {
    const submittedValue = submittedAnswers.get(snapshot.questionId);
    maxPoints += snapshot.points;

    let graded:
      | ReturnType<typeof gradeTrueFalse>
      | ReturnType<typeof gradeSingleChoice>
      | ReturnType<typeof gradeMultipleChoice>;

    switch (snapshot.type) {
      case QuestionType.TRUE_FALSE:
        graded = gradeTrueFalse(snapshot, submittedValue);
        break;
      case QuestionType.SINGLE_CHOICE:
        graded = gradeSingleChoice(snapshot, submittedValue);
        break;
      case QuestionType.MULTIPLE_CHOICE:
        graded = gradeMultipleChoice(snapshot, submittedValue);
        break;
      default:
        graded = {
          answer: {
            questionId: snapshot.questionId,
            value: null,
            isCorrect: false,
            earnedPoints: 0,
            maxPoints: snapshot.points,
            answeredAt: null,
          },
          points: snapshot.points,
          earnedPoints: 0,
          isCorrect: false,
          submittedValue: null,
          correctValue: null,
          explanation: snapshot.explanation,
          feedback: snapshot.explanation,
        };
        break;
    }

    earnedPoints += graded.earnedPoints;
    answers.push(graded.answer);
    review.push({
      questionId: snapshot.questionId,
      title: snapshot.title,
      statement: snapshot.statement,
      type: snapshot.type,
      points: graded.points,
      earnedPoints: graded.earnedPoints,
      isCorrect: graded.isCorrect,
      submittedValue: graded.submittedValue,
      correctValue: graded.correctValue,
      explanation: graded.explanation,
      feedback: graded.feedback,
      availableOptions:
        snapshot.type === QuestionType.SINGLE_CHOICE ||
        snapshot.type === QuestionType.MULTIPLE_CHOICE
          ? (
              (snapshot.questionConfig as { options: QuestionOption[] })
                .options ?? []
            ).map((option) => ({
              key: option.key,
              text: option.text,
            }))
          : null,
    });
  }

  return {
    answers,
    review,
    earnedPoints: Number(earnedPoints.toFixed(2)),
    maxPoints,
  };
}
