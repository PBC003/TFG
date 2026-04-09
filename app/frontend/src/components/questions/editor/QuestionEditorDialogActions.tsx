import { DialogActions } from "@mui/material";
import Button from "@mui/material/Button";
import type { TFunction } from "i18next";
import type { FormState } from "./question-editor.types";

type QuestionEditorDialogActionsProps = {
  questionId: string | null | undefined;
  form: FormState;
  submitting: boolean;
  t: TFunction;
  onClose: () => void;
  onSubmit: () => Promise<void>;
};

export function QuestionEditorDialogActions({
  questionId,
  form,
  submitting,
  t,
  onClose,
  onSubmit,
}: QuestionEditorDialogActionsProps) {
  return (
    <DialogActions>
      <Button onClick={onClose} disabled={submitting}>
        {t("common.cancel")}
      </Button>
      <Button
        onClick={() => void onSubmit()}
        variant="contained"
        disabled={submitting || form.type === "parametric"}
      >
        {questionId ? t("common.save") : t("common.create")}
      </Button>
    </DialogActions>
  );
}
