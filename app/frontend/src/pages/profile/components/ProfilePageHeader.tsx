import { Avatar, Card, CardContent, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import type { PublicUser } from "../../../types/auth";
import { RoleChip } from "../../../components/common/RoleChip";
import { StatusChip } from "../../../components/common/StatusChip";

interface ProfilePageHeaderProps {
  user: PublicUser;
}

export function ProfilePageHeader({ user }: ProfilePageHeaderProps) {
  const { t } = useTranslation();

  const initials =
    `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

  return (
    <Card
      sx={(theme) => ({
        overflow: "hidden",
        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 62%, ${alpha(
          theme.palette.primary.main,
          0.92,
        )} 100%)`,
        color: theme.palette.common.white,
        border: "none",
      })}
    >
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2.5}
          alignItems={{ xs: "flex-start", sm: "center" }}
        >
          <Avatar
            sx={(theme) => ({
              width: 76,
              height: 76,
              fontSize: "1.4rem",
              fontWeight: 800,
              bgcolor: alpha(theme.palette.secondary.main, 0.18),
              color: theme.palette.secondary.main,
              border: `1px solid ${alpha(theme.palette.common.white, 0.14)}`,
            })}
          >
            {initials}
          </Avatar>

          <Stack spacing={1}>
            <Typography
              variant="overline"
              sx={(theme) => ({
                color: alpha(theme.palette.common.white, 0.68),
              })}
            >
              {t("profile.title")}
            </Typography>
            <Typography variant="h4">{`${user.firstName} ${user.lastName}`}</Typography>
            <Typography
              sx={(theme) => ({
                color: alpha(theme.palette.common.white, 0.72),
              })}
            >
              {user.email}
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              <RoleChip role={user.role} />
              <StatusChip isActive={user.isActive} />
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
