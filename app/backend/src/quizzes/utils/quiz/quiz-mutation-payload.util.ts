import { CreateQuizDto } from '../../dto/create-quiz.dto';
import { UpdateQuizDto } from '../../dto/update-quiz.dto';
import type { QuizDocument } from '../../schemas/quiz.schema';
import { QuizzesSharedService } from '../../quizzes-shared.service';

export type QuizMutationPayload = {
  title: string;
  description: string | null;
  accessCode: string;
  requiresAccessCode: boolean;
  attemptsAllowed: number;
  startAt: Date | null;
  endAt: Date | null;
  timeLimitMinutes: number | null;
  shuffleQuestions: boolean;
  revealAnswersAfterClose: boolean;
  questions: { questionId: string; points: number }[];
};

export async function normalizeQuizMutationPayload(
  sharedService: QuizzesSharedService,
  payload: CreateQuizDto | UpdateQuizDto,
  currentQuiz?: QuizDocument,
): Promise<QuizMutationPayload> {
  const title = (payload.title ?? currentQuiz?.title)?.trim();
  const description =
    payload.description !== undefined
      ? payload.description?.trim() || null
      : (currentQuiz?.description ?? null);
  const requiresAccessCode =
    payload.requiresAccessCode ?? currentQuiz?.requiresAccessCode ?? false;
  const accessCodeInput =
    payload.accessCode !== undefined
      ? payload.accessCode?.trim() || null
      : null;
  const accessCode = sharedService.normalizeAccessCode(
    requiresAccessCode
      ? (accessCodeInput ??
          currentQuiz?.accessCode ??
          sharedService.generateAccessCode())
      : (currentQuiz?.accessCode ?? sharedService.generateAccessCode()),
  );
  const attemptsAllowed =
    payload.attemptsAllowed ?? currentQuiz?.attemptsAllowed;
  const startAt =
    payload.startAt !== undefined
      ? toNullableDate(sharedService, payload.startAt)
      : (currentQuiz?.startAt ?? null);
  const endAt =
    payload.endAt !== undefined
      ? toNullableDate(sharedService, payload.endAt)
      : (currentQuiz?.endAt ?? null);
  const timeLimitMinutes =
    payload.timeLimitMinutes !== undefined
      ? (payload.timeLimitMinutes ?? null)
      : (currentQuiz?.timeLimitMinutes ?? null);
  const shuffleQuestions =
    payload.shuffleQuestions ?? currentQuiz?.shuffleQuestions ?? false;
  const revealAnswersAfterClose =
    payload.revealAnswersAfterClose ??
    currentQuiz?.revealAnswersAfterClose ??
    false;
  const questions = payload.questions ?? currentQuiz?.questions;

  if (!title || attemptsAllowed === undefined || !questions) {
    sharedService.throwBadRequest(
      'common.bad_request',
      'Incomplete quiz payload',
    );
  }

  if (endAt && startAt && endAt.getTime() <= startAt.getTime()) {
    sharedService.throwBadRequest(
      'quiz.invalid_schedule',
      'Quiz end date must be later than its start date',
    );
  }

  await sharedService.assertAccessCodeIsAvailable(
    accessCode,
    currentQuiz?.quizId,
  );
  await sharedService.assertQuestionReferencesAreValid(questions);

  return {
    title,
    description,
    accessCode,
    requiresAccessCode,
    attemptsAllowed,
    startAt,
    endAt,
    timeLimitMinutes,
    shuffleQuestions,
    revealAnswersAfterClose,
    questions: questions.map((question) => ({
      questionId: question.questionId,
      points: Number(question.points),
    })),
  };
}

function toNullableDate(
  sharedService: QuizzesSharedService,
  value: string | null | undefined,
): Date | null {
  if (!value || value.trim().length === 0) {
    return null;
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    sharedService.throwBadRequest(
      'quiz.invalid_schedule',
      'Invalid quiz schedule',
    );
  }

  return parsedDate;
}
