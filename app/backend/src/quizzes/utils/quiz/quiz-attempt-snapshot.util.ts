import { QuestionType } from '../../../questions/enums/question-type.enum';
import type { QuestionDocument } from '../../../questions/schemas/question.schema';
import { generateDistinctParametricQuestionInstances } from '../../../questions/utils/parametric-question-template.util';
import type {
  MultipleChoiceQuestionConfig,
  ParametricQuestionConfig,
  SingleChoiceQuestionConfig,
  TrueFalseQuestionConfig,
} from '../../../questions/types/question-type-config.type';
import type { QuizAttemptDocument } from '../../schemas/quiz-attempt.schema';
import type { QuizDocument } from '../../schemas/quiz.schema';
import type {
  ParametricAttemptQuestionConfig,
  SupportedQuestionConfig,
} from '../../types/quiz.types';

function shuffleItems<T>(items: T[]): T[] {
  const clonedItems = [...items];

  for (let index = clonedItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const currentItem = clonedItems[index];
    clonedItems[index] = clonedItems[swapIndex];
    clonedItems[swapIndex] = currentItem;
  }

  return clonedItems;
}

function buildParametricAttemptQuestionConfig(
  question: QuestionDocument,
  toleranceOverride?: number | null,
): {
  questionConfig: ParametricAttemptQuestionConfig;
  statement: string;
} | null {
  const config = question.questionConfig as ParametricQuestionConfig;
  const [instance] =
    generateDistinctParametricQuestionInstances(config, 1, {
      toleranceOverride,
    }) ?? [];

  if (!instance) {
    return null;
  }

  return {
    statement: instance.statement,
    questionConfig: {
      templateId: instance.templateId,
      tolerance: instance.tolerance,
      generatedValues: instance.generatedValues,
      correctAnswerNumeric: instance.correctAnswerNumeric,
      correctAnswerLatex: instance.correctAnswerLatex,
      inputPlaceholder: instance.inputPlaceholder,
    },
  };
}

export function createAttemptQuestionConfig(question: QuestionDocument): {
  questionConfig: SupportedQuestionConfig | ParametricAttemptQuestionConfig;
  statement: string;
} | null {
  switch (question.type) {
    case QuestionType.TRUE_FALSE: {
      const config = question.questionConfig as TrueFalseQuestionConfig;
      return {
        statement: question.statement,
        questionConfig: { ...config },
      };
    }
    case QuestionType.SINGLE_CHOICE: {
      const config = question.questionConfig as SingleChoiceQuestionConfig;

      return {
        statement: question.statement,
        questionConfig: {
          ...config,
          options: config.randomizeOptions
            ? shuffleItems(config.options)
            : [...config.options],
        },
      };
    }
    case QuestionType.MULTIPLE_CHOICE: {
      const config = question.questionConfig as MultipleChoiceQuestionConfig;

      return {
        statement: question.statement,
        questionConfig: {
          ...config,
          options: config.randomizeOptions
            ? shuffleItems(config.options)
            : [...config.options],
        },
      };
    }
    case QuestionType.PARAMETRIC:
      return buildParametricAttemptQuestionConfig(question);
    default:
      return null;
  }
}

function buildParametricAttemptQuestionSnapshots(
  question: QuestionDocument,
  quizQuestion: QuizDocument['questions'][number],
): QuizAttemptDocument['questions'] | null {
  const config = question.questionConfig as ParametricQuestionConfig;
  const quantity = Number(quizQuestion.quantity ?? 1);
  const instances = generateDistinctParametricQuestionInstances(
    config,
    quantity,
    {
      toleranceOverride: quizQuestion.toleranceOverride,
    },
  );

  if (!instances) {
    return null;
  }

  return instances.map((instance, index) => ({
    questionId:
      quantity > 1
        ? `${question.questionId}::${index + 1}`
        : question.questionId,
    title: question.title,
    type: question.type,
    statement: instance.statement,
    explanation: question.explanation,
    tags: question.tags,
    points: quizQuestion.points,
    order: 0,
    questionConfig: {
      templateId: instance.templateId,
      tolerance: instance.tolerance,
      generatedValues: instance.generatedValues,
      correctAnswerNumeric: instance.correctAnswerNumeric,
      correctAnswerLatex: instance.correctAnswerLatex,
      inputPlaceholder: instance.inputPlaceholder,
    } satisfies ParametricAttemptQuestionConfig,
  }));
}

export function buildAttemptQuestionSnapshots(
  quiz: QuizDocument,
  questionMap: Map<string, QuestionDocument>,
): QuizAttemptDocument['questions'] | null {
  const orderedQuestions = quiz.questions.flatMap((quizQuestion) => {
    const question = questionMap.get(quizQuestion.questionId);

    if (!question) {
      return [null];
    }

    if (question.type === QuestionType.PARAMETRIC) {
      const snapshots = buildParametricAttemptQuestionSnapshots(
        question,
        quizQuestion,
      );
      return snapshots ?? [null];
    }

    const prepared = createAttemptQuestionConfig(question);

    if (!prepared) {
      return [null];
    }

    return [
      {
        questionId: question.questionId,
        title: question.title,
        type: question.type,
        statement: prepared.statement,
        explanation: question.explanation,
        tags: question.tags,
        points: quizQuestion.points,
        order: 0,
        questionConfig: prepared.questionConfig,
      },
    ];
  });

  if (orderedQuestions.some((question) => question === null)) {
    return null;
  }

  const stableQuestions = orderedQuestions.filter(
    (question): question is NonNullable<typeof question> => question !== null,
  );
  const finalQuestions = quiz.shuffleQuestions
    ? shuffleItems(stableQuestions)
    : stableQuestions;

  return finalQuestions.map((question, index) => ({
    ...question,
    order: index,
  }));
}
