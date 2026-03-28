import { QuestionType } from '../enums/question-type.enum';
import type {
  MultipleChoiceQuestionConfig,
  ParametricQuestionConfig,
  QuestionOption,
  QuestionTypeConfig,
  SingleChoiceQuestionConfig,
} from '../types/question-type-config.type';

export type QuestionMathFieldError = {
  field: string;
  message: string;
};

export type QuestionMathValidationResult = {
  isValid: boolean;
  errors: QuestionMathFieldError[];
};

const FORBIDDEN_HTML_PATTERNS = [/<\s*script/iu, /javascript\s*:/iu];

function hasForbiddenHtmlContent(value: string): boolean {
  return FORBIDDEN_HTML_PATTERNS.some((pattern) => pattern.test(value));
}

function isEscaped(text: string, index: number): boolean {
  let slashCount = 0;
  let cursor = index - 1;

  while (cursor >= 0 && text[cursor] === '\\') {
    slashCount += 1;
    cursor -= 1;
  }

  return slashCount % 2 === 1;
}

function validateLatexDelimiters(text: string): string[] {
  const errors: string[] = [];
  const stack: Array<'$' | '$$' | '\\(' | '\\['> = [];

  for (let index = 0; index < text.length; index += 1) {
    if (isEscaped(text, index)) {
      continue;
    }

    const nextTwoChars = text.slice(index, index + 2);

    if (nextTwoChars === '$$') {
      const currentTop = stack[stack.length - 1];
      if (currentTop === '$$') {
        stack.pop();
      } else if (currentTop === '$') {
        errors.push('Inline and block dollar delimiters cannot be nested');
      } else {
        stack.push('$$');
      }
      index += 1;
      continue;
    }

    if (nextTwoChars === '\\(') {
      stack.push('\\(');
      index += 1;
      continue;
    }

    if (nextTwoChars === '\\)') {
      const currentTop = stack[stack.length - 1];
      if (currentTop !== '\\(') {
        errors.push('Found \\) without a matching \\(');
      } else {
        stack.pop();
      }
      index += 1;
      continue;
    }

    if (nextTwoChars === '\\[') {
      stack.push('\\[');
      index += 1;
      continue;
    }

    if (nextTwoChars === '\\]') {
      const currentTop = stack[stack.length - 1];
      if (currentTop !== '\\[') {
        errors.push('Found \\] without a matching \\[');
      } else {
        stack.pop();
      }
      index += 1;
      continue;
    }

    if (text[index] === '$') {
      const currentTop = stack[stack.length - 1];
      if (currentTop === '$') {
        stack.pop();
      } else if (currentTop === '$$') {
        errors.push(
          'Inline dollar delimiters cannot appear inside $$...$$ blocks',
        );
      } else {
        stack.push('$');
      }
    }
  }

  stack.forEach((delimiter) => {
    switch (delimiter) {
      case '$':
        errors.push('Unclosed inline math delimiter $');
        break;
      case '$$':
        errors.push('Unclosed block math delimiter $$');
        break;
      case '\\(':
        errors.push('Unclosed inline math delimiter \\(');
        break;
      case '\\[':
        errors.push('Unclosed block math delimiter \\[');
        break;
      default:
        break;
    }
  });

  return errors;
}

export function validateMathTextContent(
  value: string,
  field: string,
): QuestionMathFieldError[] {
  const normalizedValue = value.trim();
  const errors: QuestionMathFieldError[] = [];

  if (normalizedValue.length === 0) {
    return errors;
  }

  if (hasForbiddenHtmlContent(normalizedValue)) {
    errors.push({
      field,
      message:
        'HTML executable content is not allowed in math-capable text fields',
    });
  }

  validateLatexDelimiters(normalizedValue).forEach((message) => {
    errors.push({ field, message });
  });

  return errors;
}

function normalizeOption(option: QuestionOption): QuestionOption {
  return {
    key: option.key.trim(),
    text: option.text.trim(),
  };
}

function normalizeSingleChoiceConfig(
  config: SingleChoiceQuestionConfig,
): SingleChoiceQuestionConfig {
  return {
    ...config,
    options: config.options.map((option) => normalizeOption(option)),
    correctOptionKey: config.correctOptionKey.trim(),
  };
}

function normalizeMultipleChoiceConfig(
  config: MultipleChoiceQuestionConfig,
): MultipleChoiceQuestionConfig {
  return {
    ...config,
    options: config.options.map((option) => normalizeOption(option)),
    correctOptionKeys: config.correctOptionKeys.map((key) => key.trim()),
  };
}

function normalizeParametricConfig(
  config: ParametricQuestionConfig,
): ParametricQuestionConfig {
  return {
    ...config,
    variables: config.variables.map((variable) => ({
      ...variable,
      name: variable.name.trim(),
    })),
    answerFormula: config.answerFormula.trim(),
    sampleAnswer:
      config.sampleAnswer === undefined
        ? undefined
        : config.sampleAnswer.trim(),
  };
}

export function normalizeQuestionTypeConfig(
  type: QuestionType,
  questionConfig: QuestionTypeConfig,
): QuestionTypeConfig {
  switch (type) {
    case QuestionType.TRUE_FALSE:
      return questionConfig;
    case QuestionType.SINGLE_CHOICE:
      return normalizeSingleChoiceConfig(
        questionConfig as SingleChoiceQuestionConfig,
      );
    case QuestionType.MULTIPLE_CHOICE:
      return normalizeMultipleChoiceConfig(
        questionConfig as MultipleChoiceQuestionConfig,
      );
    case QuestionType.PARAMETRIC:
      return normalizeParametricConfig(
        questionConfig as ParametricQuestionConfig,
      );
    default:
      return questionConfig;
  }
}

function validateOptionTexts(
  options: QuestionOption[],
  prefix: string,
): QuestionMathFieldError[] {
  return options.flatMap((option, index) =>
    validateMathTextContent(option.text, `${prefix}.options[${index}].text`),
  );
}

export function validateQuestionMathContent(
  type: QuestionType,
  statement: string,
  explanation: string | null,
  questionConfig: QuestionTypeConfig,
): QuestionMathValidationResult {
  const errors: QuestionMathFieldError[] = [
    ...validateMathTextContent(statement, 'statement'),
  ];

  if (explanation !== null) {
    errors.push(...validateMathTextContent(explanation, 'explanation'));
  }

  switch (type) {
    case QuestionType.SINGLE_CHOICE: {
      const config = questionConfig as SingleChoiceQuestionConfig;
      errors.push(...validateOptionTexts(config.options, 'questionConfig'));
      break;
    }
    case QuestionType.MULTIPLE_CHOICE: {
      const config = questionConfig as MultipleChoiceQuestionConfig;
      errors.push(...validateOptionTexts(config.options, 'questionConfig'));
      break;
    }
    case QuestionType.PARAMETRIC: {
      const config = questionConfig as ParametricQuestionConfig;
      errors.push(
        ...validateMathTextContent(
          config.answerFormula,
          'questionConfig.answerFormula',
        ),
      );

      if (config.sampleAnswer !== undefined) {
        errors.push(
          ...validateMathTextContent(
            config.sampleAnswer,
            'questionConfig.sampleAnswer',
          ),
        );
      }
      break;
    }
    default:
      break;
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
