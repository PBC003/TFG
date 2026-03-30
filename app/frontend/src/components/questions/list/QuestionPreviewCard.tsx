import { Paper, Stack, Typography } from "@mui/material";
import { type ReactNode } from "react";
import { MathText } from "../../math/MathText";

interface QuestionPreviewCardProps {
  title?: string;
  content?: string | null;
  emptyText?: string;
  caption?: string;
  action?: ReactNode;
}

export function QuestionPreviewCard({
  title,
  content,
  emptyText,
  caption,
  action,
}: QuestionPreviewCardProps) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
      <Stack spacing={1.25}>
        {title || action ? (
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={1}
          >
            {title ? (
              <Typography variant="subtitle2" fontWeight={700}>
                {title}
              </Typography>
            ) : (
              <span />
            )}
            {action}
          </Stack>
        ) : null}
        <MathText value={content} emptyText={emptyText} />
        {caption ? (
          <Typography variant="caption" color="text.secondary">
            {caption}
          </Typography>
        ) : null}
      </Stack>
    </Paper>
  );
}
