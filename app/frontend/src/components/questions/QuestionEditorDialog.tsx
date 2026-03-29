import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  Alert,
  Box,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import Button from "@mui/material/Button";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type {
  CreateQuestionInput,
  MultipleChoiceQuestionConfig,
  QuestionItem,
  QuestionOption,
  QuestionType,
  QuestionTypeConfig,
  SingleChoiceQuestionConfig,
  TrueFalseQuestionConfig,
  UpdateQuestionInput,
} from "../../types/question";

interface QuestionEditorDialogProps {
  open: boolean;
  question: QuestionItem | null;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (
    payload: CreateQuestionInput | UpdateQuestionInput,
  ) => Promise<void>;
}

type EditableOption = {
  key: string;
  text: string;
  feedback: string;
  isCorrect: boolean;
};

type FormState = {
  title: string;
  type: QuestionType;
  statement: string;
  explanation: string;
  tags: string[];
  newTag: string;
  trueFalse: {
    correctAnswer: boolean;
    feedbackForTrue: string;
    feedbackForFalse: string;
  };
  singleChoice: {
    options: EditableOption[];
    randomizeOptions: boolean;
  };
  multipleChoice: {
    options: EditableOption[];
    randomizeOptions: boolean;
    gradingMode: "all_or_nothing" | "partial_credit";
  };
};

const QUESTION_TYPES: QuestionType[] = [
  "true_false",
  "single_choice",
  "multiple_choice",
  "parametric",
];

function buildOptionKey(index: number): string {
  return String.fromCharCode(97 + index);
}

function createEmptyOption(index: number, isCorrect = false): EditableOption {
  return {
    key: buildOptionKey(index),
    text: "",
    feedback: "",
    isCorrect,
  };
}

function normalizeOptionList(
  options: QuestionOption[] | undefined,
  correctKeys: string[],
): EditableOption[] {
  const source =
    options && options.length >= 2
      ? options
      : [createEmptyOption(0, true), createEmptyOption(1, false)];

  const correctKeySet = new Set(correctKeys);

  const normalized = source.map((option, index) => ({
    key: option.key?.trim() || buildOptionKey(index),
    text: option.text ?? "",
    feedback: option.feedback ?? "",
    isCorrect: correctKeySet.has(option.key),
  }));

  if (!normalized.some((option) => option.isCorrect) && normalized.length > 0) {
    normalized[0] = { ...normalized[0], isCorrect: true };
  }

  return normalized;
}

function buildInitialState(question: QuestionItem | null): FormState {
  if (!question) {
    return {
      title: "",
      type: "true_false",
      statement: "",
      explanation: "",
      tags: [],
      newTag: "",
      trueFalse: {
        correctAnswer: true,
        feedbackForTrue: "",
        feedbackForFalse: "",
      },
      singleChoice: {
        options: [createEmptyOption(0, true), createEmptyOption(1, false)],
        randomizeOptions: false,
      },
      multipleChoice: {
        options: [createEmptyOption(0, true), createEmptyOption(1, false)],
        randomizeOptions: false,
        gradingMode: "all_or_nothing",
      },
    };
  }

  const trueFalseConfig =
    question.questionConfig as Partial<TrueFalseQuestionConfig>;
  const singleChoiceConfig =
    question.questionConfig as Partial<SingleChoiceQuestionConfig>;
  const multipleChoiceConfig =
    question.questionConfig as Partial<MultipleChoiceQuestionConfig>;

  return {
    title: question.title,
    type: question.type,
    statement: question.statement,
    explanation: question.explanation ?? "",
    tags: question.tags,
    newTag: "",
    trueFalse: {
      correctAnswer: trueFalseConfig.correctAnswer ?? true,
      feedbackForTrue: trueFalseConfig.feedbackForTrue ?? "",
      feedbackForFalse: trueFalseConfig.feedbackForFalse ?? "",
    },
    singleChoice: {
      options: normalizeOptionList(
        singleChoiceConfig.options,
        singleChoiceConfig.correctOptionKey
          ? [singleChoiceConfig.correctOptionKey]
          : [],
      ),
      randomizeOptions: Boolean(singleChoiceConfig.randomizeOptions),
    },
    multipleChoice: {
      options: normalizeOptionList(
        multipleChoiceConfig.options,
        multipleChoiceConfig.correctOptionKeys ?? [],
      ),
      randomizeOptions: Boolean(multipleChoiceConfig.randomizeOptions),
      gradingMode: multipleChoiceConfig.gradingMode ?? "all_or_nothing",
    },
  };
}

function normalizeTags(tags: string[]): string[] {
  return Array.from(
    new Set(tags.map((tag) => tag.trim()).filter((tag) => tag.length > 0)),
  );
}

function buildQuestionConfig(form: FormState): QuestionTypeConfig {
  switch (form.type) {
    case "true_false":
      return {
        correctAnswer: form.trueFalse.correctAnswer,
        feedbackForTrue: form.trueFalse.feedbackForTrue.trim() || null,
        feedbackForFalse: form.trueFalse.feedbackForFalse.trim() || null,
      };
    case "single_choice": {
      const options = form.singleChoice.options.map((option, index) => ({
        key: option.key || buildOptionKey(index),
        text: option.text.trim(),
        feedback: option.feedback.trim() || null,
      }));

      const correctOption = form.singleChoice.options.find(
        (option) => option.isCorrect,
      );

      return {
        options,
        correctOptionKey: correctOption?.key ?? options[0]?.key ?? "a",
        randomizeOptions: form.singleChoice.randomizeOptions,
      };
    }
    case "multiple_choice": {
      const options = form.multipleChoice.options.map((option, index) => ({
        key: option.key || buildOptionKey(index),
        text: option.text.trim(),
        feedback: option.feedback.trim() || null,
      }));

      return {
        options,
        correctOptionKeys: form.multipleChoice.options
          .filter((option) => option.isCorrect)
          .map((option) => option.key),
        randomizeOptions: form.multipleChoice.randomizeOptions,
        gradingMode: form.multipleChoice.gradingMode,
      };
    }
    case "parametric":
      return {
        variables: [{ name: "a", min: 1, max: 5, step: 1 }],
        answerFormula: "a",
        tolerance: 0.01,
        sampleAnswer: "a",
      };
  }
}

function validateForm(
  form: FormState,
  t: ReturnType<typeof useTranslation>["t"],
): string | null {
  if (form.type === "parametric") {
    return t("questions.dialogs.parametricUnavailable");
  }

  if (form.title.trim().length < 3) {
    return t("questions.dialogs.titleValidation");
  }

  if (form.statement.trim().length === 0) {
    return t("questions.dialogs.statementValidation");
  }

  if (form.type === "single_choice") {
    const options = form.singleChoice.options;

    if (
      options.length < 2 ||
      options.some((option) => option.text.trim().length === 0)
    ) {
      return t("questions.dialogs.optionsValidation");
    }

    if (!options.some((option) => option.isCorrect)) {
      return t("questions.dialogs.singleChoiceValidation");
    }
  }

  if (form.type === "multiple_choice") {
    const options = form.multipleChoice.options;

    if (
      options.length < 2 ||
      options.some((option) => option.text.trim().length === 0)
    ) {
      return t("questions.dialogs.optionsValidation");
    }

    if (!options.some((option) => option.isCorrect)) {
      return t("questions.dialogs.multipleChoiceValidation");
    }
  }

  return null;
}

export function QuestionEditorDialog({
  open,
  question,
  submitting,
  onClose,
  onSubmit,
}: QuestionEditorDialogProps) {
  const { t } = useTranslation();
  const [form, setForm] = useState<FormState>(() =>
    buildInitialState(question),
  );
  const [formError, setFormError] = useState<string | null>(null);

  const dialogTitle = question
    ? t("questions.dialogs.editTitle")
    : t("questions.dialogs.createTitle");

  const submitLabel = question ? t("common.save") : t("common.create");
  const isParametricDisabled = form.type === "parametric";

  const handleTypeChange = (nextType: QuestionType) => {
    setForm((current) => ({ ...current, type: nextType }));
    setFormError(null);
  };

  const handleAddTag = () => {
    const nextTag = form.newTag.trim();

    if (!nextTag) {
      return;
    }

    setForm((current) => ({
      ...current,
      tags: normalizeTags([...current.tags, nextTag]),
      newTag: "",
    }));
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setForm((current) => ({
      ...current,
      tags: current.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const updateSingleChoiceOption = (
    index: number,
    field: keyof EditableOption,
    value: string | boolean,
  ) => {
    setForm((current) => ({
      ...current,
      singleChoice: {
        ...current.singleChoice,
        options: current.singleChoice.options.map((option, optionIndex) => {
          if (optionIndex !== index) {
            return field === "isCorrect"
              ? { ...option, isCorrect: false }
              : option;
          }

          return {
            ...option,
            [field]: value,
          };
        }),
      },
    }));
  };

  const updateMultipleChoiceOption = (
    index: number,
    field: keyof EditableOption,
    value: string | boolean,
  ) => {
    setForm((current) => ({
      ...current,
      multipleChoice: {
        ...current.multipleChoice,
        options: current.multipleChoice.options.map((option, optionIndex) =>
          optionIndex === index
            ? {
                ...option,
                [field]: value,
              }
            : option,
        ),
      },
    }));
  };

  const addSingleChoiceOption = () => {
    setForm((current) => ({
      ...current,
      singleChoice: {
        ...current.singleChoice,
        options: [
          ...current.singleChoice.options,
          createEmptyOption(current.singleChoice.options.length),
        ],
      },
    }));
  };

  const addMultipleChoiceOption = () => {
    setForm((current) => ({
      ...current,
      multipleChoice: {
        ...current.multipleChoice,
        options: [
          ...current.multipleChoice.options,
          createEmptyOption(current.multipleChoice.options.length),
        ],
      },
    }));
  };

  const removeSingleChoiceOption = (index: number) => {
    setForm((current) => {
      const nextOptions = current.singleChoice.options.filter(
        (_, optionIndex) => optionIndex !== index,
      );

      if (!nextOptions.some((option) => option.isCorrect) && nextOptions[0]) {
        nextOptions[0] = { ...nextOptions[0], isCorrect: true };
      }

      return {
        ...current,
        singleChoice: {
          ...current.singleChoice,
          options: nextOptions,
        },
      };
    });
  };

  const removeMultipleChoiceOption = (index: number) => {
    setForm((current) => {
      const nextOptions = current.multipleChoice.options.filter(
        (_, optionIndex) => optionIndex !== index,
      );

      if (!nextOptions.some((option) => option.isCorrect) && nextOptions[0]) {
        nextOptions[0] = { ...nextOptions[0], isCorrect: true };
      }

      return {
        ...current,
        multipleChoice: {
          ...current.multipleChoice,
          options: nextOptions,
        },
      };
    });
  };

  const handleSubmit = async () => {
    const validationError = validateForm(form, t);

    if (validationError) {
      setFormError(validationError);
      return;
    }

    setFormError(null);

    const payload: CreateQuestionInput | UpdateQuestionInput = {
      title: form.title.trim(),
      type: form.type,
      statement: form.statement.trim(),
      explanation: form.explanation.trim() || null,
      tags: normalizeTags(form.tags),
      questionConfig: buildQuestionConfig(form),
    };

    await onSubmit(payload);
  };

  const renderTrueFalseEditor = () => (
    <Stack spacing={2}>
      <TextField
        select
        label={t("questions.fields.correctAnswer")}
        value={String(form.trueFalse.correctAnswer)}
        onChange={(event) =>
          setForm((current) => ({
            ...current,
            trueFalse: {
              ...current.trueFalse,
              correctAnswer: event.target.value === "true",
            },
          }))
        }
        fullWidth
      >
        <MenuItem value="true">{t("questions.answers.true")}</MenuItem>
        <MenuItem value="false">{t("questions.answers.false")}</MenuItem>
      </TextField>

      <Stack spacing={1.5}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={1.5}>
            <Typography fontWeight={700}>
              {t("questions.answers.true")}
            </Typography>
            <TextField
              label={t("questions.fields.optionFeedback")}
              value={form.trueFalse.feedbackForTrue}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  trueFalse: {
                    ...current.trueFalse,
                    feedbackForTrue: event.target.value,
                  },
                }))
              }
              fullWidth
              multiline
              minRows={2}
            />
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={1.5}>
            <Typography fontWeight={700}>
              {t("questions.answers.false")}
            </Typography>
            <TextField
              label={t("questions.fields.optionFeedback")}
              value={form.trueFalse.feedbackForFalse}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  trueFalse: {
                    ...current.trueFalse,
                    feedbackForFalse: event.target.value,
                  },
                }))
              }
              fullWidth
              multiline
              minRows={2}
            />
          </Stack>
        </Paper>
      </Stack>
    </Stack>
  );

  const renderSingleChoiceEditor = () => (
    <Stack spacing={2}>
      <FormControlLabel
        control={
          <Switch
            checked={form.singleChoice.randomizeOptions}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                singleChoice: {
                  ...current.singleChoice,
                  randomizeOptions: event.target.checked,
                },
              }))
            }
          />
        }
        label={t("questions.fields.randomizeOptions")}
      />

      <Stack spacing={1.5}>
        {form.singleChoice.options.map((option, index) => (
          <Paper
            key={`single-${option.key}-${index}`}
            variant="outlined"
            sx={{ p: 2 }}
          >
            <Stack spacing={1.5}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography fontWeight={700}>
                  {t("questions.fields.optionLabel", { index: index + 1 })}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={option.isCorrect}
                        onChange={() =>
                          updateSingleChoiceOption(index, "isCorrect", true)
                        }
                      />
                    }
                    label={t("questions.fields.correctOption")}
                  />
                  <IconButton
                    aria-label={t("common.delete")}
                    onClick={() => removeSingleChoiceOption(index)}
                    disabled={form.singleChoice.options.length <= 2}
                  >
                    <DeleteOutlineRoundedIcon />
                  </IconButton>
                </Stack>
              </Stack>

              <TextField
                label={t("questions.fields.optionText")}
                value={option.text}
                onChange={(event) =>
                  updateSingleChoiceOption(index, "text", event.target.value)
                }
                fullWidth
                helperText={t("questions.dialogs.latexFieldHelper")}
              />

              <TextField
                label={t("questions.fields.optionFeedback")}
                value={option.feedback}
                onChange={(event) =>
                  updateSingleChoiceOption(
                    index,
                    "feedback",
                    event.target.value,
                  )
                }
                fullWidth
                multiline
                minRows={2}
              />
            </Stack>
          </Paper>
        ))}
      </Stack>

      <Box>
        <Button startIcon={<AddRoundedIcon />} onClick={addSingleChoiceOption}>
          {t("questions.actions.addOption")}
        </Button>
      </Box>
    </Stack>
  );

  const renderMultipleChoiceEditor = () => (
    <Stack spacing={2}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <FormControlLabel
          control={
            <Switch
              checked={form.multipleChoice.randomizeOptions}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  multipleChoice: {
                    ...current.multipleChoice,
                    randomizeOptions: event.target.checked,
                  },
                }))
              }
            />
          }
          label={t("questions.fields.randomizeOptions")}
        />

        <TextField
          select
          label={t("questions.fields.gradingMode")}
          value={form.multipleChoice.gradingMode}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              multipleChoice: {
                ...current.multipleChoice,
                gradingMode: event.target.value as
                  | "all_or_nothing"
                  | "partial_credit",
              },
            }))
          }
          sx={{ minWidth: { xs: "100%", md: 260 } }}
        >
          <MenuItem value="all_or_nothing">
            {t("questions.gradingModes.all_or_nothing")}
          </MenuItem>
          <MenuItem value="partial_credit">
            {t("questions.gradingModes.partial_credit")}
          </MenuItem>
        </TextField>
      </Stack>

      <Stack spacing={1.5}>
        {form.multipleChoice.options.map((option, index) => (
          <Paper
            key={`multiple-${option.key}-${index}`}
            variant="outlined"
            sx={{ p: 2 }}
          >
            <Stack spacing={1.5}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography fontWeight={700}>
                  {t("questions.fields.optionLabel", { index: index + 1 })}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={option.isCorrect}
                        onChange={(event) =>
                          updateMultipleChoiceOption(
                            index,
                            "isCorrect",
                            event.target.checked,
                          )
                        }
                      />
                    }
                    label={t("questions.fields.optionIsCorrect")}
                  />
                  <IconButton
                    aria-label={t("common.delete")}
                    onClick={() => removeMultipleChoiceOption(index)}
                    disabled={form.multipleChoice.options.length <= 2}
                  >
                    <DeleteOutlineRoundedIcon />
                  </IconButton>
                </Stack>
              </Stack>

              <TextField
                label={t("questions.fields.optionText")}
                value={option.text}
                onChange={(event) =>
                  updateMultipleChoiceOption(index, "text", event.target.value)
                }
                fullWidth
                helperText={t("questions.dialogs.latexFieldHelper")}
              />

              <TextField
                label={t("questions.fields.optionFeedback")}
                value={option.feedback}
                onChange={(event) =>
                  updateMultipleChoiceOption(
                    index,
                    "feedback",
                    event.target.value,
                  )
                }
                fullWidth
                multiline
                minRows={2}
              />
            </Stack>
          </Paper>
        ))}
      </Stack>

      <Box>
        <Button
          startIcon={<AddRoundedIcon />}
          onClick={addMultipleChoiceOption}
        >
          {t("questions.actions.addOption")}
        </Button>
      </Box>
    </Stack>
  );

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3} sx={{ pt: 0.5 }}>
          <Alert icon={<InfoOutlinedIcon fontSize="inherit" />} severity="info">
            <Stack spacing={0.75}>
              <Typography fontWeight={700}>
                {t("questions.dialogs.latexTitle")}
              </Typography>
              <Typography variant="body2">
                {t("questions.dialogs.latexHelper")}
              </Typography>
            </Stack>
          </Alert>

          {formError ? <Alert severity="error">{formError}</Alert> : null}

          <TextField
            label={t("questions.fields.title")}
            value={form.title}
            onChange={(event) =>
              setForm((current) => ({ ...current, title: event.target.value }))
            }
            fullWidth
            required
          />

          <TextField
            select
            label={t("questions.fields.type")}
            value={form.type}
            onChange={(event) =>
              handleTypeChange(event.target.value as QuestionType)
            }
            fullWidth
          >
            {QUESTION_TYPES.map((type) => (
              <MenuItem key={type} value={type}>
                {t(`questions.types.${type}`)}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label={t("questions.fields.statement")}
            value={form.statement}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                statement: event.target.value,
              }))
            }
            fullWidth
            required
            multiline
            minRows={4}
            helperText={t("questions.dialogs.latexFieldHelper")}
          />

          <TextField
            label={t("questions.fields.generalFeedback")}
            value={form.explanation}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                explanation: event.target.value,
              }))
            }
            fullWidth
            multiline
            minRows={3}
            helperText={t("questions.dialogs.feedbackRuleHelper")}
          />

          <Stack spacing={1.5}>
            <Typography variant="subtitle1" fontWeight={700}>
              {t("questions.fields.tags")}
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
              <TextField
                label={t("questions.fields.newTag")}
                value={form.newTag}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    newTag: event.target.value,
                  }))
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder={t("questions.dialogs.tagPlaceholder")}
                fullWidth
              />
              <Button
                variant="outlined"
                onClick={handleAddTag}
                sx={{ minWidth: 150 }}
              >
                {t("questions.actions.addTag")}
              </Button>
            </Stack>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {form.tags.length > 0 ? (
                form.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                  />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {t("questions.dialogs.noTags")}
                </Typography>
              )}
            </Stack>
          </Stack>

          <Divider />

          <Stack spacing={1.5}>
            <Typography variant="h6">
              {t("questions.fields.typeSpecificConfig")}
            </Typography>
            {form.type === "true_false" ? renderTrueFalseEditor() : null}
            {form.type === "single_choice" ? renderSingleChoiceEditor() : null}
            {form.type === "multiple_choice"
              ? renderMultipleChoiceEditor()
              : null}
            {form.type === "parametric" ? (
              <Alert severity="warning">
                {t("questions.dialogs.parametricUnavailable")}
              </Alert>
            ) : null}
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          {t("common.cancel")}
        </Button>
        <Button
          onClick={() => void handleSubmit()}
          variant="contained"
          disabled={submitting || isParametricDisabled}
        >
          {submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
