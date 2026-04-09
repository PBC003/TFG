import { describe, expect, it } from "vitest";
import { tokenizeMathText } from "../../../../src/components/math/math-text.utils";

describe("tokenizeMathText", () => {
  it("returns a single text token when there is no math content", () => {
    expect(tokenizeMathText("solo texto")).toEqual([
      { type: "text", value: "solo texto" },
    ]);
  });

  it("tokenizes inline and display math with surrounding text", () => {
    expect(
      tokenizeMathText("Antes $x+1$ medio \\(y\\) y bloque $$z^2$$ final"),
    ).toEqual([
      { type: "text", value: "Antes " },
      { type: "math", value: "x+1", raw: "$x+1$", displayMode: false },
      { type: "text", value: " medio " },
      { type: "math", value: "y", raw: "\\(y\\)", displayMode: false },
      { type: "text", value: " y bloque " },
      { type: "math", value: "z^2", raw: "$$z^2$$", displayMode: true },
      { type: "text", value: " final" },
    ]);
  });

  it("supports square-bracket display delimiters", () => {
    expect(tokenizeMathText("inicio \\[x^2 + 1\\] fin")).toEqual([
      { type: "text", value: "inicio " },
      {
        type: "math",
        value: "x^2 + 1",
        raw: "\\[x^2 + 1\\]",
        displayMode: true,
      },
      { type: "text", value: " fin" },
    ]);
  });

  it("keeps escaped delimiters and unmatched openings as plain text", () => {
    expect(tokenizeMathText(String.raw`precio \$5 y $sin cierre`)).toEqual([
      { type: "text", value: String.raw`precio \$5 y $sin cierre` },
    ]);
  });

  it("ignores escaped closing delimiters until it finds a real closing delimiter", () => {
    expect(tokenizeMathText(String.raw`inicio $a \$ b$ fin`)).toEqual([
      { type: "text", value: "inicio " },
      {
        type: "math",
        value: String.raw`a \$ b`,
        raw: String.raw`$a \$ b$`,
        displayMode: false,
      },
      { type: "text", value: " fin" },
    ]);
  });
});
