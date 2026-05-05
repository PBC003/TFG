import {
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { MathText } from "../../../components/math/MathText";
import type {
  PublicAttemptQuestion,
  QuizAnswerValue,
} from "../../../types/quiz";
import { getPublicQuestionOptions } from "../utils/quiz-access.utils";
import { getParametricAnswerValidationMessage } from "../utils/parametric-answer-validation.util.ts";

type QuizQuestionInputProps = {
  question: PublicAttemptQuestion;
  value: QuizAnswerValue;
  onChange: (nextValue: QuizAnswerValue) => void;
  disabled: boolean;
  parametricValidationMessage?: string | null;
};

export function QuizQuestionInput({
  question,
  value,
  onChange,
  disabled,
  parametricValidationMessage,
}: QuizQuestionInputProps) {
  const { t } = useTranslation();

  if (question.type === "true_false") {
    return (
      <RadioGroup
        value={typeof value === "boolean" ? String(value) : ""}
        onChange={(event) => onChange(event.target.value === "true")}
      >
        <FormControlLabel
          value="true"
          control={<Radio disabled={disabled} />}
          label={t("questions.answers.true")}
        />
        <FormControlLabel
          value="false"
          control={<Radio disabled={disabled} />}
          label={t("questions.answers.false")}
        />
      </RadioGroup>
    );
  }

  const options = getPublicQuestionOptions(question);

  if (question.type === "single_choice") {
    return (
      <RadioGroup
        value={typeof value === "string" ? value : ""}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <FormControlLabel
            key={option.key}
            value={option.key}
            control={<Radio disabled={disabled} />}
            label={<MathText value={option.text} emptyText="—" />}
          />
        ))}
      </RadioGroup>
    );
  }

  if (question.type === "multiple_choice") {
    const selectedValues = Array.isArray(value)
      ? value.filter((item): item is string => typeof item === "string")
      : [];

    return (
      <Stack spacing={1}>
        {options.map((option) => {
          const checked = selectedValues.includes(option.key);

          return (
            <FormControlLabel
              key={option.key}
              control={
                <Checkbox
                  checked={checked}
                  disabled={disabled}
                  onChange={(event) => {
                    if (event.target.checked) {
                      onChange([...selectedValues, option.key]);
                      return;
                    }

                    onChange(
                      selectedValues.filter(
                        (candidate) => candidate !== option.key,
                      ),
                    );
                  }}
                />
              }
              label={<MathText value={option.text} emptyText="—" />}
            />
          );
        })}
      </Stack>
    );
  }

  const placeholder =
    "inputPlaceholder" in question.questionConfig
      ? question.questionConfig.inputPlaceholder
      : "";
  const tolerance =
    "tolerance" in question.questionConfig
      ? question.questionConfig.tolerance
      : 0;

  const rawValue = typeof value === "string" ? value : "";
  const validationReason =
    parametricValidationMessage ??
    getParametricAnswerValidationMessage(rawValue);

  return (
    <Stack spacing={1.25}>
      <TextField
        label={t("quizAccess.parametricAnswerLabel")}
        value={rawValue}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        fullWidth
        placeholder={placeholder}
        error={Boolean(validationReason)}
        helperText={
          validationReason
            ? t(`quizAccess.parametricAnswerValidation.${validationReason}`)
            : undefined
        }
      />
      {validationReason ? null : (
        <Typography variant="caption" color="text.secondary">
          {t("quizAccess.parametricAnswerHelper", { tolerance })}
        </Typography>
      )}
    </Stack>
  );
}
