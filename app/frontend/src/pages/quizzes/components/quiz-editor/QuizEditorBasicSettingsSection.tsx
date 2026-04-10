import { memo } from "react";
import { Box, FormControlLabel, Stack, Switch, TextField } from "@mui/material";
import type { QuizEditorDialogProps } from "./quiz-editor-dialog.types";

type QuizEditorBasicSettingsSectionProps = {
  fields: QuizEditorDialogProps["fields"];
  submitting: boolean;
  quizTitle: string;
  quizDescription: string;
  accessCode: string;
  attemptsAllowed: string;
  startAt: string;
  endAt: string;
  timeLimitMinutes: string;
  shuffleQuestions: boolean;
  revealAnswersAfterClose: boolean;
  onQuizTitleChange: (value: string) => void;
  onQuizDescriptionChange: (value: string) => void;
  onAccessCodeChange: (value: string) => void;
  onAttemptsAllowedChange: (value: string) => void;
  onStartAtChange: (value: string) => void;
  onEndAtChange: (value: string) => void;
  onTimeLimitMinutesChange: (value: string) => void;
  onShuffleQuestionsChange: (value: boolean) => void;
  onRevealAnswersAfterCloseChange: (value: boolean) => void;
};

export const QuizEditorBasicSettingsSection = memo(
  function QuizEditorBasicSettingsSection({
    fields,
    submitting,
    quizTitle,
    quizDescription,
    accessCode,
    attemptsAllowed,
    startAt,
    endAt,
    timeLimitMinutes,
    shuffleQuestions,
    revealAnswersAfterClose,
    onQuizTitleChange,
    onQuizDescriptionChange,
    onAccessCodeChange,
    onAttemptsAllowedChange,
    onStartAtChange,
    onEndAtChange,
    onTimeLimitMinutesChange,
    onShuffleQuestionsChange,
    onRevealAnswersAfterCloseChange,
  }: QuizEditorBasicSettingsSectionProps) {
    return (
      <>
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, minmax(0, 1fr))",
            },
          }}
        >
          <TextField
            label={fields.title}
            value={quizTitle}
            onChange={(event) => onQuizTitleChange(event.target.value)}
            disabled={submitting}
            required
            fullWidth
          />
          <TextField
            label={fields.attemptsAllowed}
            value={attemptsAllowed}
            onChange={(event) => onAttemptsAllowedChange(event.target.value)}
            disabled={submitting}
            type="number"
            inputProps={{ min: 1, max: 10 }}
            fullWidth
          />
          <TextField
            label={fields.timeLimitMinutes}
            value={timeLimitMinutes}
            onChange={(event) => onTimeLimitMinutesChange(event.target.value)}
            disabled={submitting}
            type="number"
            inputProps={{ min: 1, max: 300 }}
            fullWidth
          />
          <TextField
            label={fields.accessCode}
            helperText={fields.accessCodeHelp}
            placeholder={fields.accessCodePlaceholder}
            value={accessCode}
            onChange={(event) =>
              onAccessCodeChange(event.target.value.toUpperCase())
            }
            disabled={submitting}
            fullWidth
          />
          <TextField
            label={fields.startAt}
            helperText={fields.startAtHelper}
            value={startAt}
            onChange={(event) => onStartAtChange(event.target.value)}
            disabled={submitting}
            type="datetime-local"
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            label={fields.endAt}
            helperText={fields.endAtHelper}
            value={endAt}
            onChange={(event) => onEndAtChange(event.target.value)}
            disabled={submitting}
            type="datetime-local"
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Box>

        <TextField
          label={fields.description}
          value={quizDescription}
          onChange={(event) => onQuizDescriptionChange(event.target.value)}
          disabled={submitting}
          minRows={3}
          multiline
          fullWidth
        />

        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
          <FormControlLabel
            control={
              <Switch
                checked={shuffleQuestions}
                onChange={(event) =>
                  onShuffleQuestionsChange(event.target.checked)
                }
                disabled={submitting}
              />
            }
            label={fields.shuffleQuestions}
          />
          <FormControlLabel
            control={
              <Switch
                checked={revealAnswersAfterClose}
                onChange={(event) =>
                  onRevealAnswersAfterCloseChange(event.target.checked)
                }
                disabled={submitting}
              />
            }
            label={fields.revealAnswersAfterClose}
          />
        </Stack>
      </>
    );
  },
);
