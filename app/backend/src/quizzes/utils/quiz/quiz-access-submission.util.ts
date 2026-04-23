import { QuestionType } from '../../../questions/enums/question-type.enum';
import type { QuizAttemptDocument } from '../../schemas/quiz-attempt.schema';
import type { SubmitQuizAttemptDto } from '../../dto/submit-quiz-attempt.dto';
import { validateParametricAnswerExpression } from '../grade/parametric-answer-evaluator.util';

export type InvalidParametricAnswerThrower = (
  code: 'quiz.invalid_parametric_answer_format',
  message: string,
  details?: Record<string, unknown>,
) => never;

export function assertSubmittedParametricAnswersAreValid(
  snapshots: QuizAttemptDocument['questions'],
  submittedAnswers: SubmitQuizAttemptDto['answers'],
  throwBadRequest: InvalidParametricAnswerThrower,
): void {
  const snapshotsByQuestionId = new Map(
    snapshots.map((snapshot) => [snapshot.questionId, snapshot]),
  );

  for (const answer of submittedAnswers) {
    const snapshot = snapshotsByQuestionId.get(answer.questionId);

    if (!snapshot || snapshot.type !== QuestionType.PARAMETRIC) {
      continue;
    }

    if (typeof answer.value !== 'string') {
      continue;
    }

    const trimmedValue = answer.value.trim();

    if (!trimmedValue) {
      continue;
    }

    const validation = validateParametricAnswerExpression(trimmedValue);

    if (validation.isValid) {
      continue;
    }

    throwBadRequest(
      'quiz.invalid_parametric_answer_format',
      'One parametric answer contains an invalid numeric expression',
      {
        questionId: snapshot.questionId,
        reason: validation.reason,
      },
    );
  }
}
