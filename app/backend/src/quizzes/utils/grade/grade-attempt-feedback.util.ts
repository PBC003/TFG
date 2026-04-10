import type { QuestionOption } from '../../../questions/types/question-type-config.type';
import type { QuizAttemptQuestionSnapshot } from '../../schemas/quiz-attempt.schema';
import { QuestionType } from '../../../questions/enums/question-type.enum';

export function coerceStringArray(value: unknown): string[] {
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

export function findOptionFeedback(
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

export function findMultipleFeedback(
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

export function getReviewAvailableOptions(
  snapshot: QuizAttemptQuestionSnapshot,
) {
  return snapshot.type === QuestionType.SINGLE_CHOICE ||
    snapshot.type === QuestionType.MULTIPLE_CHOICE
    ? (
        (snapshot.questionConfig as { options: QuestionOption[] }).options ?? []
      ).map((option) => ({
        key: option.key,
        text: option.text,
      }))
    : null;
}
