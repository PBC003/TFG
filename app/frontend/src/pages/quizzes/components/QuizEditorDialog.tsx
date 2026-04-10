import { Dialog } from "@mui/material";
import { QuizEditorDialogContent } from "./quiz-editor/QuizEditorDialogContent";
import type { QuizEditorDialogProps } from "./quiz-editor/quiz-editor-dialog.types";

export function QuizEditorDialog({
  open,
  quiz,
  ...props
}: QuizEditorDialogProps) {
  const dialogKey = `${quiz?.quizId ?? "new"}-${open ? "open" : "closed"}`;

  return (
    <Dialog
      open={open}
      onClose={props.submitting ? undefined : props.onClose}
      maxWidth="lg"
      fullWidth
    >
      {open ? (
        <QuizEditorDialogContent key={dialogKey} quiz={quiz} {...props} />
      ) : null}
    </Dialog>
  );
}
