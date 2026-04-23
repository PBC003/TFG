import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { AdminUser, Role } from "../../../../types/auth";
import {
  validateFirstName,
  validateLastName,
  validateUniOviEmail,
} from "../../../../utils/validation";

export interface UserEditFormValue {
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
}

interface UserEditDialogProps {
  open: boolean;
  user: AdminUser | null;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (payload: UserEditFormValue) => Promise<void>;
}

type FormErrors = Record<"firstName" | "lastName" | "email", string | null>;

function UserEditDialogContent({
  open,
  user,
  submitting,
  onClose,
  onSubmit,
}: UserEditDialogProps & { user: AdminUser }) {
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState<Role>(user.role);
  const [errors, setErrors] = useState<FormErrors>({
    firstName: null,
    lastName: null,
    email: null,
  });

  const validate = () => {
    const nextErrors: FormErrors = {
      firstName: validateFirstName(firstName),
      lastName: validateLastName(lastName),
      email: validateUniOviEmail(email),
    };

    setErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    await onSubmit({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      role,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>{t("admin.dialogs.editTitle")}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            label={t("auth.firstName")}
            value={firstName}
            onChange={(event) => {
              setFirstName(event.target.value);
              if (errors.firstName) {
                setErrors((current) => ({ ...current, firstName: null }));
              }
            }}
            error={Boolean(errors.firstName)}
            helperText={errors.firstName ? t(errors.firstName) : " "}
          />
          <TextField
            label={t("auth.lastName")}
            value={lastName}
            onChange={(event) => {
              setLastName(event.target.value);
              if (errors.lastName) {
                setErrors((current) => ({ ...current, lastName: null }));
              }
            }}
            error={Boolean(errors.lastName)}
            helperText={errors.lastName ? t(errors.lastName) : " "}
          />
          <TextField
            label={t("auth.email")}
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (errors.email) {
                setErrors((current) => ({ ...current, email: null }));
              }
            }}
            error={Boolean(errors.email)}
            helperText={errors.email ? t(errors.email) : " "}
          />
          <TextField
            select
            label={t("common.role")}
            value={role}
            onChange={(event) => setRole(event.target.value as Role)}
          >
            <MenuItem value="ADMIN">{t("roles.ADMIN")}</MenuItem>
            <MenuItem value="TEACHER">{t("roles.TEACHER")}</MenuItem>
            <MenuItem value="STUDENT">{t("roles.STUDENT")}</MenuItem>
          </TextField>
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
          {t("common.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function UserEditDialog(props: UserEditDialogProps) {
  if (!props.user) {
    return null;
  }

  return (
    <UserEditDialogContent
      key={`${props.user.id}-${props.open ? "open" : "closed"}`}
      {...props}
      user={props.user}
    />
  );
}
