import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Button from "@mui/material/Button";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type {
  CreateQuestionInput,
  QuestionItem,
  QuestionType,
  UpdateQuestionInput,
} from "../../types/question";
import { QuestionMathField } from "./QuestionMathField";
import { QuestionTagsEditor } from "./QuestionTagsEditor";
import { QuestionTypeSpecificConfig } from "./QuestionTypeSpecificConfig";
import type {
  EditableOption,
  FormState,
  PreviewState,
} from "./question-editor.types";
import {
  QUESTION_TYPES,
  buildInitialState,
  buildQuestionConfig,
  createEmptyOption,
  ensureAtLeastOneCorrectOption,
  normalizeTags,
  validateForm,
} from "./question-editor.utils";

interface QuestionEditorDialogProps {
  open: boolean;
  question: QuestionItem | null;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (
    payload: CreateQuestionInput | UpdateQuestionInput,
  ) => Promise<void>;
}

export function QuestionEditorDialog(props: QuestionEditorDialogProps) {
  const dialogStateKey = `${props.question?.questionId ?? "create"}-${props.open ? "open" : "closed"}`;

  return <QuestionEditorDialogBody key={dialogStateKey} {...props} />;
}

function QuestionEditorDialogBody({
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
  const [previewFields, setPreviewFields] = useState<PreviewState>({});

  const updateForm = (updater: (current: FormState) => FormState) => {
    setForm(updater);
  };

  const togglePreviewField = (fieldKey: string) => {
    setPreviewFields((current) => ({
      ...current,
      [fieldKey]: !current[fieldKey],
    }));
  };

  const updateSingleChoiceOption = (
    index: number,
    field: keyof EditableOption,
    value: string | boolean,
  ) => {
    updateForm((current) => ({
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
    updateForm((current) => ({
      ...current,
      multipleChoice: {
        ...current.multipleChoice,
        options: current.multipleChoice.options.map((option, optionIndex) =>
          optionIndex === index ? { ...option, [field]: value } : option,
        ),
      },
    }));
  };

  const handleAddTag = () => {
    const nextTag = form.newTag.trim();

    if (!nextTag) {
      return;
    }

    updateForm((current) => ({
      ...current,
      tags: normalizeTags([...current.tags, nextTag]),
      newTag: "",
    }));
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

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle>
        {question
          ? t("questions.dialogs.editTitle")
          : t("questions.dialogs.createTitle")}
      </DialogTitle>
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
              <Typography variant="caption" color="inherit">
                {t("questions.dialogs.perFieldPreviewHelper")}
              </Typography>
            </Stack>
          </Alert>

          {formError ? <Alert severity="error">{formError}</Alert> : null}

          <TextField
            label={t("questions.fields.title")}
            value={form.title}
            onChange={(event) =>
              updateForm((current) => ({
                ...current,
                title: event.target.value,
              }))
            }
            fullWidth
            required
          />

          <TextField
            select
            label={t("questions.fields.type")}
            value={form.type}
            onChange={(event) =>
              updateForm((current) => ({
                ...current,
                type: event.target.value as QuestionType,
              }))
            }
            fullWidth
          >
            {QUESTION_TYPES.map((type) => (
              <MenuItem key={type} value={type}>
                {t(`questions.types.${type}`)}
              </MenuItem>
            ))}
          </TextField>

          <QuestionMathField
            fieldKey="statement"
            label={t("questions.fields.statement")}
            value={form.statement}
            isPreview={Boolean(previewFields.statement)}
            onTogglePreview={togglePreviewField}
            onChange={(nextValue) =>
              updateForm((current) => ({ ...current, statement: nextValue }))
            }
            minRows={4}
            required
            helperText={t("questions.dialogs.latexFieldHelper")}
          />

          <QuestionMathField
            fieldKey="generalFeedback"
            label={t("questions.fields.generalFeedback")}
            value={form.explanation}
            isPreview={Boolean(previewFields.generalFeedback)}
            onTogglePreview={togglePreviewField}
            onChange={(nextValue) =>
              updateForm((current) => ({ ...current, explanation: nextValue }))
            }
            minRows={3}
            helperText={t("questions.dialogs.feedbackRuleHelper")}
          />

          <QuestionTagsEditor
            label={t("questions.fields.tags")}
            newTagLabel={t("questions.fields.newTag")}
            newTagValue={form.newTag}
            onNewTagChange={(nextValue) =>
              updateForm((current) => ({ ...current, newTag: nextValue }))
            }
            onAddTag={handleAddTag}
            tags={form.tags}
            onRemoveTag={(tagToRemove) =>
              updateForm((current) => ({
                ...current,
                tags: current.tags.filter((tag) => tag !== tagToRemove),
              }))
            }
            addTagLabel={t("questions.actions.addTag")}
            placeholder={t("questions.dialogs.tagPlaceholder")}
            emptyText={t("questions.dialogs.noTags")}
          />

          <Divider />

          <QuestionTypeSpecificConfig
            form={form}
            latexFieldHelper={t("questions.dialogs.latexFieldHelper")}
            isPreview={(fieldKey) => Boolean(previewFields[fieldKey])}
            onTogglePreview={togglePreviewField}
            onUpdateForm={updateForm}
            onUpdateSingleChoiceOption={updateSingleChoiceOption}
            onUpdateMultipleChoiceOption={updateMultipleChoiceOption}
            onAddSingleChoiceOption={() =>
              updateForm((current) => ({
                ...current,
                singleChoice: {
                  ...current.singleChoice,
                  options: [
                    ...current.singleChoice.options,
                    createEmptyOption(current.singleChoice.options.length),
                  ],
                },
              }))
            }
            onAddMultipleChoiceOption={() =>
              updateForm((current) => ({
                ...current,
                multipleChoice: {
                  ...current.multipleChoice,
                  options: [
                    ...current.multipleChoice.options,
                    createEmptyOption(current.multipleChoice.options.length),
                  ],
                },
              }))
            }
            onRemoveSingleChoiceOption={(index) =>
              updateForm((current) => ({
                ...current,
                singleChoice: {
                  ...current.singleChoice,
                  options: ensureAtLeastOneCorrectOption(
                    current.singleChoice.options.filter(
                      (_, optionIndex) => optionIndex !== index,
                    ),
                  ),
                },
              }))
            }
            onRemoveMultipleChoiceOption={(index) =>
              updateForm((current) => ({
                ...current,
                multipleChoice: {
                  ...current.multipleChoice,
                  options: ensureAtLeastOneCorrectOption(
                    current.multipleChoice.options.filter(
                      (_, optionIndex) => optionIndex !== index,
                    ),
                  ),
                },
              }))
            }
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          {t("common.cancel")}
        </Button>
        <Button
          onClick={() => void handleSubmit()}
          variant="contained"
          disabled={submitting || form.type === "parametric"}
        >
          {question ? t("common.save") : t("common.create")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
