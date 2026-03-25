import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

interface UserConfirmDialogProps {
  confirmColor?: "error" | "warning" | "success" | "primary";
  confirmLabel: string;
  description: string;
  open: boolean;
  submitting: boolean;
  title: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function UserConfirmDialog({
  confirmColor = "primary",
  confirmLabel,
  description,
  open,
  submitting,
  title,
  onClose,
  onConfirm,
}: UserConfirmDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography color="text.secondary">{description}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          {t("common.cancel")}
        </Button>
        <Button
          color={confirmColor}
          variant="contained"
          onClick={() => void onConfirm()}
          disabled={submitting}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
