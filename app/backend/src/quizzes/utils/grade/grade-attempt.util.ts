import { QuestionType } from '../../../questions/enums/question-type.enum';
import type {
  QuizAttemptAnswer,
  QuizAttemptQuestionSnapshot,
} from '../../schemas/quiz-attempt.schema';
import type { QuizSubmissionQuestionReview } from '../../types/quiz.types';
import { getReviewAvailableOptions } from './grade-attempt-feedback.util';
import { gradeMultipleChoiceQuestion } from './grade-multiple-choice.util';
import { gradeSingleChoiceQuestion } from './grade-single-choice.util';
import { gradeTrueFalseQuestion } from './grade-true-false.util';
import type {
  GradedAttempt,
  GradedQuestionResult,
  SubmittedAnswerMap,
} from './grade-attempt.types';

function gradeUnsupportedQuestion(
  snapshot: QuizAttemptQuestionSnapshot,
): GradedQuestionResult {
  return {
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
}

function toReviewItem(
  snapshot: QuizAttemptQuestionSnapshot,
  graded: GradedQuestionResult,
): QuizSubmissionQuestionReview {
  return {
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
    availableOptions: getReviewAvailableOptions(snapshot),
  };
}

function gradeQuestion(
  snapshot: QuizAttemptQuestionSnapshot,
  submittedValue: unknown,
): GradedQuestionResult {
  switch (snapshot.type) {
    case QuestionType.TRUE_FALSE:
      return gradeTrueFalseQuestion(snapshot, submittedValue);
    case QuestionType.SINGLE_CHOICE:
      return gradeSingleChoiceQuestion(snapshot, submittedValue);
    case QuestionType.MULTIPLE_CHOICE:
      return gradeMultipleChoiceQuestion(snapshot, submittedValue);
    default:
      return gradeUnsupportedQuestion(snapshot);
  }
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

    const graded = gradeQuestion(snapshot, submittedValue);
    earnedPoints += graded.earnedPoints;
    answers.push(graded.answer);
    review.push(toReviewItem(snapshot, graded));
  }

  return {
    answers,
    review,
    earnedPoints: Number(earnedPoints.toFixed(2)),
    maxPoints,
  };
}
