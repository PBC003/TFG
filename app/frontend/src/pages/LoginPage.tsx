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
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ROUTES } from "../constants/routes";
import { useAuth } from "../hooks/useAuth";
import { ApiError } from "../services/http/api-client";
import { getErrorMessage } from "../utils/error-code";
import {
  normalizeUniOviLoginIdentifier,
  validatePassword,
  validateUniOviLoginIdentifier,
} from "../utils/validation";

interface LocationState {
  from?: {
    pathname?: string;
  };
  successMessage?: string;
}

export default function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>(
    {},
  );
  const [submitting, setSubmitting] = useState(false);

  const locationState = (location.state as LocationState | null) ?? null;
  const target = locationState?.from?.pathname ?? ROUTES.home;
  const successMessage = locationState?.successMessage ?? null;

  const validate = () => {
    const nextErrors = {
      email: validateUniOviLoginIdentifier(email),
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
      await auth.login({
        email: normalizeUniOviLoginIdentifier(email),
        password,
      });
      navigate(target, { replace: true });
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.status === 401 ||
          error.code === "common.unauthorized" ||
          error.code === "auth.unauthorized")
      ) {
        setErrorMessage(t("errors.codes.auth.invalid_credentials"));
      } else {
        setErrorMessage(getErrorMessage(t, error));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card sx={{ maxWidth: 560, mx: "auto" }}>
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={2.5}>
          <Stack spacing={1}>
            <Typography variant="h4" fontWeight={700}>
              {t("auth.loginTitle")}
            </Typography>
            <Typography color="text.secondary">
              {t("auth.loginSubtitle")}
            </Typography>
          </Stack>

          {successMessage ? (
            <Alert severity="success">{successMessage}</Alert>
          ) : null}
          {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

          <TextField
            label={t("auth.email")}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={Boolean(fieldErrors.email)}
            helperText={
              fieldErrors.email
                ? t(fieldErrors.email)
                : t("auth.loginIdentifierHint")
            }
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
              {t("auth.submitLogin")}
            </Button>
            <Button component={RouterLink} to={ROUTES.register} variant="text">
              {t("nav.register")}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
