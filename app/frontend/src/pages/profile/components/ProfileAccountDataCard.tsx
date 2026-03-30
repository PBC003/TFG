import {
  Box,
  Card,
  CardContent,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import { useTranslation } from "react-i18next";
import type { PublicUser } from "../../../types/auth";
import { formatDateTime } from "../../../utils/date";

interface ProfileAccountDataCardProps {
  user: PublicUser;
}

interface ReadOnlyProfileFieldProps {
  label: string;
  value: string;
}

function ReadOnlyProfileField({ label, value }: ReadOnlyProfileFieldProps) {
  return (
    <TextField
      label={label}
      value={value}
      slotProps={{ htmlInput: { readOnly: true } }}
    />
  );
}

export function ProfileAccountDataCard({ user }: ProfileAccountDataCardProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? "es";

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={3}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: 3,
                bgcolor: "secondary.light",
                color: "secondary.dark",
                display: "grid",
                placeItems: "center",
              }}
            >
              <PersonRoundedIcon />
            </Box>
            <Box>
              <Typography variant="h6">{t("profile.accountData")}</Typography>
              <Typography color="text.secondary" variant="body2">
                {t("profile.accountDataDescription")}
              </Typography>
            </Box>
          </Stack>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <ReadOnlyProfileField
                label={t("auth.firstName")}
                value={user.firstName}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <ReadOnlyProfileField
                label={t("auth.lastName")}
                value={user.lastName}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <ReadOnlyProfileField
                label={t("auth.email")}
                value={user.email}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <ReadOnlyProfileField label="UO" value={user.uo} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <ReadOnlyProfileField
                label={t("common.role")}
                value={t(`roles.${user.role}`)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <ReadOnlyProfileField
                label={t("profile.accountState")}
                value={
                  user.isActive ? t("common.active") : t("common.inactive")
                }
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <ReadOnlyProfileField
                label={t("profile.createdAt")}
                value={formatDateTime(user.createdAt, locale)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <ReadOnlyProfileField
                label={t("profile.updatedAt")}
                value={formatDateTime(user.updatedAt, locale)}
              />
            </Grid>
          </Grid>
        </Stack>
      </CardContent>
    </Card>
  );
}
