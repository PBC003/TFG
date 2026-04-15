import { Dialog, DialogTitle } from "@mui/material";
import { useTranslation } from "react-i18next";
import type {
  CreateQuestionInput,
  QuestionItem,
  UpdateQuestionInput,
} from "../../../types/question";
import { QuestionEditorDialogActions } from "./QuestionEditorDialogActions";
import { QuestionEditorDialogContent } from "./QuestionEditorDialogContent";
import { useQuestionEditorDialog } from "./useQuestionEditorDialog";

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
  const editor = useQuestionEditorDialog({ question, onSubmit, t });

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{ sx: { borderRadius: 2, overflow: "hidden" } }}
    >
      <DialogTitle>
        {question
          ? t("questions.dialogs.editTitle")
          : t("questions.dialogs.createTitle")}
      </DialogTitle>

      <QuestionEditorDialogContent
        form={editor.form}
        formError={editor.formError}
        previewFields={editor.previewFields}
        t={t}
        onUpdateForm={editor.updateForm}
        onTogglePreviewField={editor.togglePreviewField}
        onAddTag={editor.handleAddTag}
        onUpdateSingleChoiceOption={editor.updateSingleChoiceOption}
        onUpdateMultipleChoiceOption={editor.updateMultipleChoiceOption}
        onAddSingleChoiceOption={editor.addSingleChoiceOption}
        onAddMultipleChoiceOption={editor.addMultipleChoiceOption}
        onRemoveSingleChoiceOption={editor.removeSingleChoiceOption}
        onRemoveMultipleChoiceOption={editor.removeMultipleChoiceOption}
      />

      <QuestionEditorDialogActions
        questionId={question?.questionId}
        form={editor.form}
        submitting={submitting}
        t={t}
        onClose={onClose}
        onSubmit={editor.handleSubmit}
      />
    </Dialog>
  );
}
