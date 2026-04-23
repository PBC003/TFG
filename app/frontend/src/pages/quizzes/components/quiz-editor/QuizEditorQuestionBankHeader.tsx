import { Stack, TextField, Typography } from "@mui/material";
import type { QuizEditorDialogProps } from "./quiz-editor-dialog.types";

type QuizEditorQuestionBankHeaderProps = {
  questionsSectionTitle: string;
  fields: QuizEditorDialogProps["fields"];
  totalSelectedSlots: number;
  searchPlaceholder: string;
  search: string;
  submitting: boolean;
  loading: boolean;
  onSearchChange: (value: string) => void;
};

export function QuizEditorQuestionBankHeader({
  questionsSectionTitle,
  fields,
  totalSelectedSlots,
  searchPlaceholder,
  search,
  submitting,
  loading,
  onSearchChange,
}: QuizEditorQuestionBankHeaderProps) {
  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      justifyContent="space-between"
      spacing={1.5}
      alignItems={{ md: "center" }}
    >
      <Stack spacing={0.5}>
        <Typography variant="h6">{questionsSectionTitle}</Typography>
        <Typography variant="body2" color="text.secondary">
          {fields.selectedQuestionsCount.replace(
            "{{count}}",
            String(totalSelectedSlots),
          )}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {fields.selectedQuestionsFirst}
        </Typography>
      </Stack>
      <TextField
        label={searchPlaceholder}
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        disabled={submitting || loading}
        fullWidth
        sx={{ maxWidth: { xs: "100%", md: 360 } }}
      />
    </Stack>
  );
}
