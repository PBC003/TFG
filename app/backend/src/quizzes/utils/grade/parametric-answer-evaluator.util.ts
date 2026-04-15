class Parser {
  private index = 0;

  constructor(private readonly source: string) {}

  parse(): number {
    const value = this.parseExpression();
    this.skipWhitespace();

    if (this.index < this.source.length) {
      throw new Error('Unexpected token');
    }

    return value;
  }

  private parseExpression(): number {
    let value = this.parseTerm();

    while (true) {
      this.skipWhitespace();

      if (this.consume('+')) {
        value += this.parseTerm();
        continue;
      }

      if (this.consume('-')) {
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

      if (this.consume('*')) {
        value *= this.parsePower();
        continue;
      }

      if (this.consume('/')) {
        value /= this.parsePower();
        continue;
      }

      return value;
    }
  }

  private parsePower(): number {
    let value = this.parseUnary();
    this.skipWhitespace();

    if (this.consume('^')) {
      value = value ** this.parsePower();
    }

    return value;
  }

  private parseUnary(): number {
    this.skipWhitespace();

    if (this.consume('+')) {
      return this.parseUnary();
    }

    if (this.consume('-')) {
      return -this.parseUnary();
    }

    return this.parsePrimary();
  }

  private parsePrimary(): number {
    this.skipWhitespace();

    if (this.consume('(')) {
      const value = this.parseExpression();
      this.skipWhitespace();

      if (!this.consume(')')) {
        throw new Error('Missing closing parenthesis');
      }

      return value;
    }

    const identifier = this.parseIdentifier();

    if (identifier) {
      if (identifier === 'pi' || identifier === 'π') {
        return Math.PI;
      }

      if (identifier === 'sqrt') {
        this.skipWhitespace();

        if (!this.consume('(')) {
          throw new Error('sqrt requires parentheses');
        }

        const value = this.parseExpression();
        this.skipWhitespace();

        if (!this.consume(')')) {
          throw new Error('Missing closing parenthesis');
        }

        return Math.sqrt(value);
      }

      throw new Error('Unsupported identifier');
    }

    return this.parseNumber();
  }

  private parseIdentifier(): string | null {
    this.skipWhitespace();
    const start = this.index;

    while (this.index < this.source.length) {
      const current = this.source[this.index];
      const isLetter = /[A-Za-zπ]/.test(current);

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

      if (/[0-9]/.test(current)) {
        this.index += 1;
        continue;
      }

      if ((current === '.' || current === ',') && !hasDecimalSeparator) {
        hasDecimalSeparator = true;
        this.index += 1;
        continue;
      }

      break;
    }

    if (start === this.index) {
      throw new Error('Expected number');
    }

    const rawValue = this.source.slice(start, this.index).replace(',', '.');
    const parsedValue = Number(rawValue);

    if (!Number.isFinite(parsedValue)) {
      throw new Error('Invalid number');
    }

    return parsedValue;
  }

  private skipWhitespace(): void {
    while (
      this.index < this.source.length &&
      /\s/.test(this.source[this.index])
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

export function evaluateParametricAnswerExpression(
  value: string,
): number | null {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return null;
  }

  try {
    const parsedValue = new Parser(normalizedValue).parse();

    return Number.isFinite(parsedValue) ? parsedValue : null;
  } catch {
    return null;
  }
}
