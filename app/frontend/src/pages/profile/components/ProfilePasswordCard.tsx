import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import KeyRoundedIcon from "@mui/icons-material/KeyRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import type { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";

interface ProfilePasswordCardProps {
  currentPassword: string;
  newPassword: string;
  errorMessage: string | null;
  submitting: boolean;
  setCurrentPassword: Dispatch<SetStateAction<string>>;
  setNewPassword: Dispatch<SetStateAction<string>>;
  handleSubmit: () => Promise<void>;
}

export function ProfilePasswordCard({
  currentPassword,
  newPassword,
  errorMessage,
  submitting,
  setCurrentPassword,
  setNewPassword,
  handleSubmit,
}: ProfilePasswordCardProps) {
  const { t } = useTranslation();

  return (
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

          {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

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
  );
}
