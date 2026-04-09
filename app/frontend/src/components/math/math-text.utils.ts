export type MathToken =
  | {
      type: "text";
      value: string;
    }
  | {
      type: "math";
      value: string;
      raw: string;
      displayMode: boolean;
    };

type SupportedDelimiter = {
  open: "$$" | "$" | "\\(" | "\\[";
  close: "$$" | "$" | "\\)" | "\\]";
  displayMode: boolean;
};

const SUPPORTED_DELIMITERS: SupportedDelimiter[] = [
  { open: "$$", close: "$$", displayMode: true },
  { open: "\\[", close: "\\]", displayMode: true },
  { open: "\\(", close: "\\)", displayMode: false },
  { open: "$", close: "$", displayMode: false },
];

function isEscaped(text: string, index: number): boolean {
  let slashCount = 0;
  let cursor = index - 1;

  while (cursor >= 0 && text[cursor] === "\\") {
    slashCount += 1;
    cursor -= 1;
  }

  return slashCount % 2 === 1;
}

function flushText(buffer: string, tokens: MathToken[]): string {
  if (buffer.length > 0) {
    tokens.push({ type: "text", value: buffer });
  }

  return "";
}

export function tokenizeMathText(value: string): MathToken[] {
  const tokens: MathToken[] = [];
  let buffer = "";
  let index = 0;

  while (index < value.length) {
    if (isEscaped(value, index)) {
      buffer += value[index];
      index += 1;
      continue;
    }

    const delimiter = SUPPORTED_DELIMITERS.find((candidate) =>
      value.startsWith(candidate.open, index),
    );

    if (!delimiter) {
      buffer += value[index];
      index += 1;
      continue;
    }

    const contentStart = index + delimiter.open.length;
    let cursor = contentStart;
    let closingIndex = -1;

    while (cursor < value.length) {
      if (
        !isEscaped(value, cursor) &&
        value.startsWith(delimiter.close, cursor)
      ) {
        closingIndex = cursor;
        break;
      }
      cursor += 1;
    }

    if (closingIndex === -1) {
      buffer += delimiter.open;
      index += delimiter.open.length;
      continue;
    }

    buffer = flushText(buffer, tokens);

    tokens.push({
      type: "math",
      value: value.slice(contentStart, closingIndex),
      raw: value.slice(index, closingIndex + delimiter.close.length),
      displayMode: delimiter.displayMode,
    });

    index = closingIndex + delimiter.close.length;
  }

  flushText(buffer, tokens);

  return tokens;
}
