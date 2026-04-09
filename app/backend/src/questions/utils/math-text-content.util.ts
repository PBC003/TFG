import type { QuestionMathFieldError } from './question-math-content.types';

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
