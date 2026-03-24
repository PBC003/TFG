import { Chip } from "@mui/material";
import { useTranslation } from "react-i18next";

interface StatusChipProps {
  isActive: boolean;
}

export function StatusChip({ isActive }: StatusChipProps) {
  const { t } = useTranslation();

  return (
    <Chip
      color={isActive ? "success" : "error"}
      label={isActive ? t("common.active") : t("common.inactive")}
      size="small"
      variant={isActive ? "filled" : "outlined"}
    />
  );
}
