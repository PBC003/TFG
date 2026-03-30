import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ROUTES } from "../../../constants/routes";
import { useAuth } from "../../../hooks/useAuth";
import { getErrorMessage } from "../../../utils/error-code";
import { validatePassword } from "../../../utils/validation";

export function useProfilePasswordForm() {
  const { t } = useTranslation();
  const auth = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    const currentPasswordError = currentPassword.trim()
      ? null
      : "forms.validation.currentPasswordRequired";
    const newPasswordError = validatePassword(newPassword);

    if (currentPasswordError || newPasswordError) {
      setErrorMessage(t(currentPasswordError ?? newPasswordError!));
      return;
    }

    if (currentPassword === newPassword) {
      setErrorMessage(t("forms.validation.samePassword"));
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      await auth.changePassword({ currentPassword, newPassword });
      navigate(ROUTES.login, {
        replace: true,
        state: { successMessage: t("auth.passwordChanged") },
      });
    } catch (error) {
      setErrorMessage(getErrorMessage(t, error));
    } finally {
      setSubmitting(false);
    }
  }, [auth, currentPassword, navigate, newPassword, t]);

  return {
    currentPassword,
    newPassword,
    errorMessage,
    submitting,
    setCurrentPassword,
    setNewPassword,
    handleSubmit,
  };
}
