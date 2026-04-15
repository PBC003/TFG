import { CreateQuestionDto } from '../dto/create-question.dto';
import { UpdateQuestionDto } from '../dto/update-question.dto';
import { QuestionType } from '../enums/question-type.enum';
import type { QuestionDocument } from '../schemas/question.schema';
import type {
  ParametricQuestionConfig,
  QuestionTypeConfig,
} from '../types/question-type-config.type';
import { normalizeQuestionTypeConfig } from './question-math-content.util';
import { buildCanonicalParametricQuestionStatement } from './parametric-question-template.util';

export type NormalizedCreateQuestionData = {
  title: string;
  type: QuestionType;
  statement: string;
  explanation: string | null;
  tags: string[];
  questionConfig: QuestionTypeConfig;
};

export type NormalizedUpdateQuestionData = {
  title?: string;
  type?: QuestionType;
  statement?: string;
  explanation?: string | null;
  tags?: string[];
  questionConfig?: QuestionTypeConfig;
};

export type ValidatedQuestionSnapshot = {
  type: QuestionType;
  statement: string;
  explanation: string | null;
  questionConfig: QuestionTypeConfig;
};

export const normalizeCreateQuestionData = (
  payload: CreateQuestionDto,
): NormalizedCreateQuestionData => {
  const normalizedQuestionConfig = normalizeQuestionTypeConfig(
    payload.type,
    payload.questionConfig as QuestionTypeConfig,
  );

  return {
    title: payload.title.trim(),
    type: payload.type,
    statement: resolveCanonicalStatement(
      payload.type,
      payload.statement.trim(),
      normalizedQuestionConfig,
    ),
    explanation: normalizeOptionalExplanation(payload.explanation),
    tags: normalizeTags(payload.tags),
    questionConfig: normalizedQuestionConfig,
  };
};

export const normalizeUpdateQuestionData = (
  payload: UpdateQuestionDto,
): NormalizedUpdateQuestionData => {
  const normalized: NormalizedUpdateQuestionData = {};

  if (payload.title !== undefined) {
    normalized.title = payload.title.trim();
  }

  if (payload.type !== undefined) {
    normalized.type = payload.type;
  }

  if (payload.statement !== undefined) {
    normalized.statement = payload.statement.trim();
  }

  if (payload.explanation !== undefined) {
    normalized.explanation = normalizeNullableExplanation(payload.explanation);
  }

  if (payload.tags !== undefined) {
    normalized.tags = normalizeTags(payload.tags);
  }

  if (payload.questionConfig !== undefined) {
    normalized.questionConfig = payload.questionConfig as QuestionTypeConfig;
  }

  return normalized;
};

export const resolveValidatedQuestionSnapshot = (
  question: Pick<
    QuestionDocument,
    'type' | 'statement' | 'explanation' | 'questionConfig'
  >,
  payload: NormalizedUpdateQuestionData,
): ValidatedQuestionSnapshot => {
  const nextType = payload.type ?? question.type;
  const nextQuestionConfig =
    payload.questionConfig === undefined
      ? question.questionConfig
      : normalizeQuestionTypeConfig(nextType, payload.questionConfig);

  return {
    type: nextType,
    statement: resolveCanonicalStatement(
      nextType,
      payload.statement ?? question.statement,
      nextQuestionConfig,
    ),
    explanation:
      payload.explanation === undefined
        ? question.explanation
        : payload.explanation,
    questionConfig: nextQuestionConfig,
  };
};

export const applyQuestionUpdate = (
  question: QuestionDocument,
  payload: NormalizedUpdateQuestionData,
): void => {
  if (payload.title !== undefined) {
    question.title = payload.title;
  }

  if (payload.type !== undefined) {
    question.type = payload.type;
  }

  if (payload.statement !== undefined) {
    question.statement = payload.statement;
  }

  if (payload.explanation !== undefined) {
    question.explanation = payload.explanation;
  }

  if (payload.tags !== undefined) {
    question.tags = payload.tags;
  }

  if (payload.questionConfig !== undefined) {
    question.questionConfig = normalizeQuestionTypeConfig(
      question.type,
      payload.questionConfig,
    );
  }

  question.statement = resolveCanonicalStatement(
    question.type,
    question.statement,
    question.questionConfig,
  );
};

const resolveCanonicalStatement = (
  type: QuestionType,
  statement: string,
  questionConfig: QuestionTypeConfig,
): string => {
  if (type !== QuestionType.PARAMETRIC) {
    return statement;
  }

  return buildCanonicalParametricQuestionStatement(
    questionConfig as ParametricQuestionConfig,
  );
};

const normalizeOptionalExplanation = (
  explanation: string | undefined | null,
): string | null => {
  if (explanation === undefined || explanation === null) {
    return null;
  }

  return explanation.trim();
};

const normalizeNullableExplanation = (
  explanation: string | null,
): string | null => (explanation === null ? null : explanation.trim());

const normalizeTags = (tags: string[] | undefined): string[] => {
  if (!tags) {
    return [];
  }

  return Array.from(
    new Set(tags.map((tag) => tag.trim()).filter((tag) => tag.length > 0)),
  );
};
