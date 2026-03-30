import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import type { QuestionItem } from "../../types/question";

type DeleteQuestionDialogProps = {
  question: QuestionItem | null;
  open: boolean;
  submitting: boolean;
  title: string;
  description: string;
  cancelLabel: string;
  confirmLabel: string;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteQuestionDialog({
  question,
  open,
  submitting,
  title,
  description,
  cancelLabel,
  confirmLabel,
  onClose,
  onConfirm,
}: DeleteQuestionDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography color="text.secondary">{description}</Typography>
        {question ? (
          <Typography sx={{ mt: 2, fontWeight: 700 }}>
            {question.title}
          </Typography>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          {cancelLabel}
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          disabled={submitting}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
