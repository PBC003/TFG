import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import {
  Box,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Stack,
  Switch,
  TextField,
} from "@mui/material";
import type { QuizEditorDialogProps } from "./quiz-editor-dialog.types";
import { generateAccessCode } from "../../utils/quiz-editor-dialog.utils";

type QuizEditorBasicSettingsSectionProps = {
  fields: QuizEditorDialogProps["fields"];
  submitting: boolean;
  quizTitle: string;
  quizDescription: string;
  accessCode: string;
  requiresAccessCode: boolean;
  attemptsAllowed: string;
  startAt: string;
  endAt: string;
  timeLimitMinutes: string;
  shuffleQuestions: boolean;
  revealAnswersAfterClose: boolean;
  onQuizTitleChange: (value: string) => void;
  onQuizDescriptionChange: (value: string) => void;
  onAccessCodeChange: (value: string) => void;
  onRequiresAccessCodeChange: (value: boolean) => void;
  onAttemptsAllowedChange: (value: string) => void;
  onStartAtChange: (value: string) => void;
  onEndAtChange: (value: string) => void;
  onTimeLimitMinutesChange: (value: string) => void;
  onShuffleQuestionsChange: (value: boolean) => void;
  onRevealAnswersAfterCloseChange: (value: boolean) => void;
};

export function QuizEditorBasicSettingsSection({
  fields,
  submitting,
  quizTitle,
  quizDescription,
  accessCode,
  requiresAccessCode,
  attemptsAllowed,
  startAt,
  endAt,
  timeLimitMinutes,
  shuffleQuestions,
  revealAnswersAfterClose,
  onQuizTitleChange,
  onQuizDescriptionChange,
  onAccessCodeChange,
  onRequiresAccessCodeChange,
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
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <FormControlLabel
            control={
              <Switch
                checked={requiresAccessCode}
                onChange={(event) =>
                  onRequiresAccessCodeChange(event.target.checked)
                }
                disabled={submitting}
              />
            }
            label={fields.accessCodeOptional}
          />
        </Box>
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

      {requiresAccessCode ? (
        <TextField
          label={fields.accessCode}
          helperText={fields.accessCodeHelp}
          value={accessCode}
          onChange={(event) =>
            onAccessCodeChange(event.target.value.toUpperCase())
          }
          disabled={submitting}
          required
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  edge="end"
                  onClick={() => onAccessCodeChange(generateAccessCode())}
                  disabled={submitting}
                  aria-label={fields.accessCodeAuto}
                >
                  <AutoAwesomeRoundedIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      ) : null}

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
}
