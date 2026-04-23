const MAX_PARAMETRIC_EXPRESSION_LENGTH = 120;
const ALLOWED_CHARACTERS_REGEX = /^[0-9+\-*/^().,\sA-Za-zπ]+$/u;
const IDENTIFIER_REGEX = /[A-Za-zπ]+/gu;
const SUPPORTED_IDENTIFIERS = new Set(["pi", "sqrt", "π"]);

export type ParametricAnswerValidationReason =
  | "empty"
  | "too_long"
  | "invalid_characters"
  | "unsupported_identifier"
  | "unbalanced_parentheses"
  | "invalid_expression";

export type ParametricAnswerValidationResult = {
  isValid: boolean;
  normalizedValue: string;
  reason: ParametricAnswerValidationReason | null;
};

class Parser {
  private index = 0;
  private readonly source: string;

  constructor(source: string) {
    this.source = source;
  }

  parse(): number {
    const value = this.parseExpression();
    this.skipWhitespace();

    if (this.index < this.source.length) {
      throw new Error("Unexpected token");
    }

    return value;
  }

  private parseExpression(): number {
    let value = this.parseTerm();

    while (true) {
      this.skipWhitespace();

      if (this.consume("+")) {
        value += this.parseTerm();
        continue;
      }

      if (this.consume("-")) {
        value -= this.parseTerm();
        continue;
      }

      return value;
    }
  }

  private parseTerm(): number {
    let value = this.parsePower();

    while (true) {
      this.skipWhitespace();

      if (this.consume("*")) {
        value *= this.parsePower();
        continue;
      }

      if (this.consume("/")) {
        value /= this.parsePower();
        continue;
      }

      return value;
    }
  }

  private parsePower(): number {
    let value = this.parseUnary();
    this.skipWhitespace();

    if (this.consume("^")) {
      value = value ** this.parsePower();
    }

    return value;
  }

  private parseUnary(): number {
    this.skipWhitespace();

    if (this.consume("+")) {
      return this.parseUnary();
    }

    if (this.consume("-")) {
      return -this.parseUnary();
    }

    return this.parsePrimary();
  }

  private parsePrimary(): number {
    this.skipWhitespace();

    if (this.consume("(")) {
      const value = this.parseExpression();
      this.skipWhitespace();

      if (!this.consume(")")) {
        throw new Error("Missing closing parenthesis");
      }

      return value;
    }

    const identifier = this.parseIdentifier();

    if (identifier) {
      if (identifier === "pi" || identifier === "π") {
        return Math.PI;
      }

      if (identifier === "sqrt") {
        this.skipWhitespace();

        if (!this.consume("(")) {
          throw new Error("sqrt requires parentheses");
        }

        const value = this.parseExpression();
        this.skipWhitespace();

        if (!this.consume(")")) {
          throw new Error("Missing closing parenthesis");
        }

        return Math.sqrt(value);
      }

      throw new Error("Unsupported identifier");
    }

    return this.parseNumber();
  }

  private parseIdentifier(): string | null {
    this.skipWhitespace();
    const start = this.index;

    while (this.index < this.source.length) {
      const current = this.source[this.index];
      const isLetter = /[A-Za-zπ]/u.test(current);

      if (!isLetter) {
        break;
      }

      this.index += 1;
    }

    if (start === this.index) {
      return null;
    }

    return this.source.slice(start, this.index).toLowerCase();
  }

  private parseNumber(): number {
    this.skipWhitespace();
    const start = this.index;
    let hasDecimalSeparator = false;

    while (this.index < this.source.length) {
      const current = this.source[this.index];

      if (/[0-9]/u.test(current)) {
        this.index += 1;
        continue;
      }

      if ((current === "." || current === ",") && !hasDecimalSeparator) {
        hasDecimalSeparator = true;
        this.index += 1;
        continue;
      }

      break;
    }

    if (start === this.index) {
      throw new Error("Expected number");
    }

    const rawValue = this.source.slice(start, this.index).replace(",", ".");
    const parsedValue = Number(rawValue);

    if (!Number.isFinite(parsedValue)) {
      throw new Error("Invalid number");
    }

    return parsedValue;
  }

  private skipWhitespace(): void {
    while (
      this.index < this.source.length &&
      /\s/u.test(this.source[this.index])
    ) {
      this.index += 1;
    }
  }

  private consume(expected: string): boolean {
    if (this.source.startsWith(expected, this.index)) {
      this.index += expected.length;
      return true;
    }

    return false;
  }
}

function hasBalancedParentheses(value: string): boolean {
  let balance = 0;

  for (const character of value) {
    if (character === "(") {
      balance += 1;
      continue;
    }

    if (character !== ")") {
      continue;
    }

    balance -= 1;

    if (balance < 0) {
      return false;
    }
  }

  return balance === 0;
}

function hasOnlySupportedIdentifiers(value: string): boolean {
  const identifiers = value.match(IDENTIFIER_REGEX) ?? [];

  return identifiers.every((identifier) =>
    SUPPORTED_IDENTIFIERS.has(identifier.toLowerCase()),
  );
}

export function validateParametricAnswerInput(
  value: string,
): ParametricAnswerValidationResult {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return { isValid: false, normalizedValue, reason: "empty" };
  }

  if (normalizedValue.length > MAX_PARAMETRIC_EXPRESSION_LENGTH) {
    return { isValid: false, normalizedValue, reason: "too_long" };
  }

  if (!ALLOWED_CHARACTERS_REGEX.test(normalizedValue)) {
    return { isValid: false, normalizedValue, reason: "invalid_characters" };
  }

  if (!hasOnlySupportedIdentifiers(normalizedValue)) {
    return {
      isValid: false,
      normalizedValue,
      reason: "unsupported_identifier",
    };
  }

  if (!hasBalancedParentheses(normalizedValue)) {
    return {
      isValid: false,
      normalizedValue,
      reason: "unbalanced_parentheses",
    };
  }

  try {
    const parsed = new Parser(normalizedValue).parse();

    if (!Number.isFinite(parsed)) {
      return { isValid: false, normalizedValue, reason: "invalid_expression" };
    }

    return { isValid: true, normalizedValue, reason: null };
  } catch {
    return { isValid: false, normalizedValue, reason: "invalid_expression" };
  }
}

export function getParametricAnswerValidationMessage(
  value: string,
): string | null {
  const validation = validateParametricAnswerInput(value);

  if (validation.isValid || validation.reason === "empty") {
    return null;
  }

  return validation.reason;
}
