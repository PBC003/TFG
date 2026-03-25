import { Chip } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { Role } from "../../types/auth.ts";

const roleColor: Record<Role, "primary" | "secondary" | "default"> = {
  ADMIN: "primary",
  TEACHER: "secondary",
  STUDENT: "default",
};

interface RoleChipProps {
  role: Role;
}

export function RoleChip({ role }: RoleChipProps) {
  const { t } = useTranslation();

  return (
    <Chip color={roleColor[role]} label={t(`roles.${role}`)} size="small" />
  );
}
