import type { GroupDocument } from '../../../groups/schemas/group.schema';
import { QuestionType } from '../../../questions/enums/question-type.enum';
import type { QuestionDocument } from '../../../questions/schemas/question.schema';
import type { QuizDocument } from '../../schemas/quiz.schema';
import { QuizStatus } from '../../enums/quiz-status.enum';
import type { QuizItem } from '../../types/quiz.types';

export type QuizItemFlags = {
  hasAttempts?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
};

export function toQuizItem(
  quiz: QuizDocument,
  questionsById: Map<string, QuestionDocument>,
  groupsById: Map<string, GroupDocument>,
  flags: QuizItemFlags = {},
): QuizItem {
  const questionItems = quiz.questions.map((quizQuestion, index) => {
    const question = questionsById.get(quizQuestion.questionId);

    return {
      questionId: quizQuestion.questionId,
      title: question?.title ?? quizQuestion.questionId,
      type: question?.type ?? QuestionType.SINGLE_CHOICE,
      statement: question?.statement ?? '',
      tags: question?.tags ?? [],
      points: quizQuestion.points,
      order: index,
      quantity: quizQuestion.quantity ?? 1,
      toleranceOverride: quizQuestion.toleranceOverride ?? null,
    };
  });

  const totalPoints = questionItems.reduce(
    (sum, question) => sum + question.points * (question.quantity ?? 1),
    0,
  );

  return {
    quizId: quiz.quizId,
    title: quiz.title,
    description: quiz.description,
    accessCode: quiz.accessCode,
    requiresAccessCode: quiz.requiresAccessCode === true,
    status: quiz.status,
    hasAttempts: flags.hasAttempts ?? false,
    canEdit: flags.canEdit ?? quiz.status !== QuizStatus.PUBLISHED,
    canDelete: flags.canDelete ?? true,
    attemptsAllowed: quiz.attemptsAllowed,
    startAt: quiz.startAt,
    endAt: quiz.endAt,
    timeLimitMinutes: quiz.timeLimitMinutes,
    shuffleQuestions: quiz.shuffleQuestions,
    revealAnswersAfterClose: quiz.revealAnswersAfterClose,
    publishedAt: quiz.publishedAt,
    audienceScope: (quiz.assignedGroupIds?.length ?? 0) > 0 ? 'groups' : 'all',
    totalQuestions: questionItems.reduce(
      (sum, question) => sum + (question.quantity ?? 1),
      0,
    ),
    totalPoints,
    questions: questionItems,
    assignedGroupIds: [...(quiz.assignedGroupIds ?? [])],
    assignedGroups: (quiz.assignedGroupIds ?? [])
      .map((groupId) => groupsById.get(groupId))
      .filter((group): group is GroupDocument => Boolean(group))
      .map((group) => ({ groupId: group.groupId, name: group.name })),
    createdByUserId: quiz.createdByUserId,
    updatedByUserId: quiz.updatedByUserId,
    version: quiz.version,
    createdAt: quiz.createdAt,
    updatedAt: quiz.updatedAt,
  };
}
