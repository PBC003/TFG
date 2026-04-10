import { QuestionType } from '../../../questions/enums/question-type.enum';
import type { QuestionDocument } from '../../../questions/schemas/question.schema';
import type {
  MultipleChoiceQuestionConfig,
  SingleChoiceQuestionConfig,
  TrueFalseQuestionConfig,
} from '../../../questions/types/question-type-config.type';
import type { QuizAttemptDocument } from '../../schemas/quiz-attempt.schema';
import type { QuizDocument } from '../../schemas/quiz.schema';
import type { SupportedQuestionConfig } from '../../types/quiz.types';

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

export function createAttemptQuestionConfig(
  question: QuestionDocument,
): SupportedQuestionConfig | null {
  switch (question.type) {
    case QuestionType.TRUE_FALSE: {
      const config = question.questionConfig as TrueFalseQuestionConfig;
      return { ...config };
    }
    case QuestionType.SINGLE_CHOICE: {
      const config = question.questionConfig as SingleChoiceQuestionConfig;

      return {
        ...config,
        options: config.randomizeOptions
          ? shuffleItems(config.options)
          : [...config.options],
      };
    }
    case QuestionType.MULTIPLE_CHOICE: {
      const config = question.questionConfig as MultipleChoiceQuestionConfig;

      return {
        ...config,
        options: config.randomizeOptions
          ? shuffleItems(config.options)
          : [...config.options],
      };
    }
    default:
      return null;
  }
}

export function buildAttemptQuestionSnapshots(
  quiz: QuizDocument,
  questionMap: Map<string, QuestionDocument>,
): QuizAttemptDocument['questions'] | null {
  const orderedQuestions = quiz.questions.map((quizQuestion) => {
    const question = questionMap.get(quizQuestion.questionId);

    if (!question) {
      return null;
    }

    const orderedConfig = createAttemptQuestionConfig(question);

    if (!orderedConfig) {
      return null;
    }

    return {
      questionId: question.questionId,
      title: question.title,
      type: question.type,
      statement: question.statement,
      explanation: question.explanation,
      tags: question.tags,
      points: quizQuestion.points,
      order: 0,
      questionConfig: orderedConfig,
    };
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
