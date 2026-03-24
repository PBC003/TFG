import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import { RoleChip } from "../common/RoleChip";
import { StatusChip } from "../common/StatusChip";

export function HomeAuthenticatedSection() {
  const { t } = useTranslation();
  const auth = useAuth();

  if (!auth.user) {
    return null;
  }

  return (
    <Card>
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={3}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 52,
                height: 52,
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
                {t("home.authenticatedWelcome", {
                  name: auth.user.firstName,
                })}
              </Typography>

              <Stack direction="row" flexWrap="wrap" gap={1}>
                <RoleChip role={auth.user.role} />
                <StatusChip isActive={auth.user.isActive} />
              </Stack>
            </Box>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
