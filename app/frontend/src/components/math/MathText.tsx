import { Box, Typography } from "@mui/material";
import { useMemo } from "react";
import katex from "katex";
import { tokenizeMathText } from "./math-text.utils";

export interface MathTextProps {
  value?: string | null;
  emptyText?: string;
}

function renderKatex(value: string, displayMode: boolean): string | null {
  try {
    return katex.renderToString(value, {
      displayMode,
      throwOnError: false,
      trust: false,
      strict: "warn",
      output: "html",
    });
  } catch {
    return null;
  }
}

export function MathText({ value, emptyText }: MathTextProps) {
  const normalizedValue = value ?? "";
  const tokens = useMemo(
    () => tokenizeMathText(normalizedValue),
    [normalizedValue],
  );

  if (normalizedValue.trim().length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        {emptyText}
      </Typography>
    );
  }

  return (
    <Box sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
      {tokens.map((token, index) => {
        if (token.type === "text") {
          return (
            <Box component="span" key={`text-${index}`}>
              {token.value}
            </Box>
          );
        }

        const html = renderKatex(token.value, token.displayMode);

        if (!html) {
          return (
            <Typography
              key={`math-fallback-${index}`}
              component="span"
              variant="body2"
              sx={{ fontFamily: "monospace" }}
            >
              {token.raw}
            </Typography>
          );
        }

        if (token.displayMode) {
          return (
            <Box
              key={`math-block-${index}`}
              sx={{ my: 1, overflowX: "auto" }}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        }

        return (
          <Box
            key={`math-inline-${index}`}
            component="span"
            sx={{ display: "inline-block", mx: 0.25, verticalAlign: "middle" }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      })}
    </Box>
  );
}
