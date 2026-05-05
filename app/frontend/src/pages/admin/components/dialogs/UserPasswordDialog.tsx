import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { validatePassword } from "../../../../utils/validation";
import type { AdminUser } from "../../../../types/auth";

interface UserPasswordDialogProps {
  open: boolean;
  user: AdminUser | null;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (newPassword: string) => Promise<void>;
}

function UserPasswordDialogContent({
  open,
  user,
  submitting,
  onClose,
  onSubmit,
}: UserPasswordDialogProps) {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const handleSubmit = async () => {
    const validationError = validatePassword(password);

    if (validationError) {
      setErrorKey(validationError);
      return;
    }

    await onSubmit(password);
  };

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>{t("admin.dialogs.passwordTitle")}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Typography color="text.secondary">
            {t("admin.dialogs.passwordDescription")}
          </Typography>
          {user ? (
            <Typography variant="body2" fontWeight={600}>
              {user.firstName} {user.lastName} · {user.email}
            </Typography>
          ) : null}
          <TextField
            type="password"
            label={t("auth.newPassword")}
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              if (errorKey) {
                setErrorKey(null);
              }
            }}
            error={Boolean(errorKey)}
            helperText={errorKey ? t(errorKey) : " "}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          {t("common.cancel")}
        </Button>
        <Button
          variant="contained"
          onClick={() => void handleSubmit()}
          disabled={submitting}
        >
          {t("common.resetPassword")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function UserPasswordDialog(props: UserPasswordDialogProps) {
  return (
    <UserPasswordDialogContent
      key={`${props.user?.id ?? "none"}-${props.open ? "open" : "closed"}`}
      {...props}
    />
  );
}
