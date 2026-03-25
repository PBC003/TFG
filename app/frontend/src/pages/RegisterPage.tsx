import {
  Alert,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ROUTES } from "../constants/routes";
import { useAuth } from "../hooks/useAuth";
import { getErrorMessage } from "../utils/error-code";
import {
  validateFirstName,
  validateLastName,
  validatePassword,
  validateUniOviEmail,
} from "../utils/validation";

export default function RegisterPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>(
    {},
  );
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const nextErrors = {
      firstName: validateFirstName(firstName),
      lastName: validateLastName(lastName),
      email: validateUniOviEmail(email),
      password: validatePassword(password),
    };

    setFieldErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      await auth.register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
      });
      navigate(ROUTES.login, {
        replace: true,
        state: { successMessage: t("auth.registerSuccess") },
      });
    } catch (error) {
      setErrorMessage(getErrorMessage(t, error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card sx={{ maxWidth: 640, mx: "auto" }}>
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={2.5}>
          <Stack spacing={1}>
            <Typography variant="h4" fontWeight={700}>
              {t("auth.registerTitle")}
            </Typography>
            <Typography color="text.secondary">
              {t("auth.registerSubtitle")}
            </Typography>
          </Stack>

          {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

          <TextField
            label={t("auth.firstName")}
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            error={Boolean(fieldErrors.firstName)}
            helperText={fieldErrors.firstName ? t(fieldErrors.firstName) : " "}
          />
          <TextField
            label={t("auth.lastName")}
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            error={Boolean(fieldErrors.lastName)}
            helperText={fieldErrors.lastName ? t(fieldErrors.lastName) : " "}
          />
          <TextField
            label={t("auth.email")}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={Boolean(fieldErrors.email)}
            helperText={fieldErrors.email ? t(fieldErrors.email) : " "}
          />
          <TextField
            type="password"
            label={t("auth.password")}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={Boolean(fieldErrors.password)}
            helperText={fieldErrors.password ? t(fieldErrors.password) : " "}
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button
              variant="contained"
              onClick={() => void handleSubmit()}
              disabled={submitting}
            >
              {t("auth.submitRegister")}
            </Button>
            <Button component={RouterLink} to={ROUTES.login} variant="text">
              {t("nav.login")}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
