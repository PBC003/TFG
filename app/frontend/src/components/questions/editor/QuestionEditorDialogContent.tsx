import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  Alert,
  DialogContent,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { TFunction } from "i18next";
import type { QuestionType } from "../../../types/question";
import { QuestionMathField } from "./QuestionMathField";
import { QuestionTagsEditor } from "./QuestionTagsEditor";
import { QuestionTypeSpecificConfig } from "../config/QuestionTypeSpecificConfig";
import { QUESTION_TYPES } from "./question-editor.utils";
import type { FormState, PreviewState } from "./question-editor.types";
import type { EditableOption } from "./question-editor.types";

type QuestionEditorDialogContentProps = {
  form: FormState;
  formError: string | null;
  previewFields: PreviewState;
  t: TFunction;
  onUpdateForm: (updater: (current: FormState) => FormState) => void;
  onTogglePreviewField: (fieldKey: string) => void;
  onAddTag: () => void;
  onUpdateSingleChoiceOption: (
    index: number,
    field: keyof EditableOption,
    value: string | boolean,
  ) => void;
  onUpdateMultipleChoiceOption: (
    index: number,
    field: keyof EditableOption,
    value: string | boolean,
  ) => void;
  onAddSingleChoiceOption: () => void;
  onAddMultipleChoiceOption: () => void;
  onRemoveSingleChoiceOption: (index: number) => void;
  onRemoveMultipleChoiceOption: (index: number) => void;
};

export function QuestionEditorDialogContent({
  form,
  formError,
  previewFields,
  t,
  onUpdateForm,
  onTogglePreviewField,
  onAddTag,
  onUpdateSingleChoiceOption,
  onUpdateMultipleChoiceOption,
  onAddSingleChoiceOption,
  onAddMultipleChoiceOption,
  onRemoveSingleChoiceOption,
  onRemoveMultipleChoiceOption,
}: QuestionEditorDialogContentProps) {
  return (
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
            onUpdateForm((current) => ({
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
            onUpdateForm((current) => ({
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
          onTogglePreview={onTogglePreviewField}
          onChange={(nextValue) =>
            onUpdateForm((current) => ({ ...current, statement: nextValue }))
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
          onTogglePreview={onTogglePreviewField}
          onChange={(nextValue) =>
            onUpdateForm((current) => ({ ...current, explanation: nextValue }))
          }
          minRows={3}
          helperText={t("questions.dialogs.feedbackRuleHelper")}
        />

        <QuestionTagsEditor
          label={t("questions.fields.tags")}
          newTagLabel={t("questions.fields.newTag")}
          newTagValue={form.newTag}
          onNewTagChange={(nextValue) =>
            onUpdateForm((current) => ({ ...current, newTag: nextValue }))
          }
          onAddTag={onAddTag}
          tags={form.tags}
          onRemoveTag={(tagToRemove) =>
            onUpdateForm((current) => ({
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
          onTogglePreview={onTogglePreviewField}
          onUpdateForm={onUpdateForm}
          onUpdateSingleChoiceOption={onUpdateSingleChoiceOption}
          onUpdateMultipleChoiceOption={onUpdateMultipleChoiceOption}
          onAddSingleChoiceOption={onAddSingleChoiceOption}
          onAddMultipleChoiceOption={onAddMultipleChoiceOption}
          onRemoveSingleChoiceOption={onRemoveSingleChoiceOption}
          onRemoveMultipleChoiceOption={onRemoveMultipleChoiceOption}
        />
      </Stack>
    </DialogContent>
  );
}
