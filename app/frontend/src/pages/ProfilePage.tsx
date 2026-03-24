import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import KeyRoundedIcon from "@mui/icons-material/KeyRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { alpha } from "@mui/material/styles";
import { ROUTES } from "../constants/routes";
import { useAuth } from "../hooks/useAuth";
import { getErrorMessage } from "../utils/error-code";
import { formatDateTime } from "../utils/date";
import { validatePassword } from "../utils/validation";
import { RoleChip } from "../components/common/RoleChip";
import { StatusChip } from "../components/common/StatusChip";

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const auth = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!auth.user) {
    return null;
  }

  const initials =
    `${auth.user.firstName.charAt(0)}${auth.user.lastName.charAt(0)}`.toUpperCase();

  const handleSubmit = async () => {
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
      await auth.changePassword({
        currentPassword,
        newPassword,
      });
      navigate(ROUTES.login, {
        replace: true,
        state: { successMessage: t("auth.passwordChanged") },
      });
    } catch (error) {
      setErrorMessage(getErrorMessage(t, error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack spacing={3.5}>
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
              <Typography variant="h4">{`${auth.user.firstName} ${auth.user.lastName}`}</Typography>
              <Typography
                sx={(theme) => ({
                  color: alpha(theme.palette.common.white, 0.72),
                })}
              >
                {auth.user.email}
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                <RoleChip role={auth.user.role} />
                <StatusChip isActive={auth.user.isActive} />
              </Stack>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 7 }}>
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
                    <Typography variant="h6">
                      {t("profile.accountData")}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      {t("profile.accountDataDescription")}
                    </Typography>
                  </Box>
                </Stack>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label={t("auth.firstName")}
                      value={auth.user.firstName}
                      slotProps={{ htmlInput: { readOnly: true } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label={t("auth.lastName")}
                      value={auth.user.lastName}
                      slotProps={{ htmlInput: { readOnly: true } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label={t("auth.email")}
                      value={auth.user.email}
                      slotProps={{ htmlInput: { readOnly: true } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="UO"
                      value={auth.user.uo}
                      slotProps={{ htmlInput: { readOnly: true } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label={t("common.role")}
                      value={t(`roles.${auth.user.role}`)}
                      slotProps={{ htmlInput: { readOnly: true } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label={t("profile.accountState")}
                      value={
                        auth.user.isActive
                          ? t("common.active")
                          : t("common.inactive")
                      }
                      slotProps={{ htmlInput: { readOnly: true } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label={t("profile.createdAt")}
                      value={formatDateTime(
                        auth.user.createdAt,
                        i18n.resolvedLanguage ?? "es",
                      )}
                      slotProps={{ htmlInput: { readOnly: true } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label={t("profile.updatedAt")}
                      value={formatDateTime(
                        auth.user.updatedAt,
                        i18n.resolvedLanguage ?? "es",
                      )}
                      slotProps={{ htmlInput: { readOnly: true } }}
                    />
                  </Grid>
                </Grid>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Stack spacing={2.5}>
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
                    <KeyRoundedIcon />
                  </Box>
                  <Box>
                    <Typography variant="h6">
                      {t("auth.changePasswordTitle")}
                    </Typography>
                  </Box>
                </Stack>

                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: "background.default",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Stack direction="row" spacing={1.25} alignItems="flex-start">
                    <ShieldRoundedIcon
                      color="secondary"
                      fontSize="small"
                      sx={{ mt: 0.2 }}
                    />
                    <Typography color="text.secondary" variant="body2">
                      {t("profile.securityHint")}
                    </Typography>
                  </Stack>
                </Box>

                {errorMessage ? (
                  <Alert severity="error">{errorMessage}</Alert>
                ) : null}

                <TextField
                  type="password"
                  label={t("auth.currentPassword")}
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                />
                <TextField
                  type="password"
                  label={t("auth.newPassword")}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                />

                <Button
                  onClick={() => void handleSubmit()}
                  variant="contained"
                  disabled={submitting}
                >
                  {t("auth.submitPasswordChange")}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}
