import type { MouseEvent } from "react";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useTranslation } from "react-i18next";

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const resolvedLanguage = (i18n.resolvedLanguage ?? "es").startsWith("en")
    ? "en"
    : "es";

  const handleChange = (
    _event: MouseEvent<HTMLElement>,
    value: string | null,
  ) => {
    if (!value || value === resolvedLanguage) {
      return;
    }

    void i18n.changeLanguage(value);
  };

  return (
    <ToggleButtonGroup
      exclusive
      aria-label={t("common.language")}
      size="small"
      value={resolvedLanguage}
      onChange={handleChange}
    >
      <ToggleButton value="es" aria-label="Español">
        ES
      </ToggleButton>
      <ToggleButton value="en" aria-label="English">
        EN
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
