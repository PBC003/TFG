import {
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import { alpha } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ROUTES } from "../../constants/routes";

interface HomeHeroProps {
  isAuthenticated: boolean;
  isAdmin: boolean;
  canManageQuestions?: boolean;
}

export function HomeHero({
  isAuthenticated,
  isAdmin,
  canManageQuestions = false,
}: HomeHeroProps) {
  const { t } = useTranslation();

  return (
    <Card
      sx={(theme) => ({
        overflow: "hidden",
        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 62%, ${alpha(
          theme.palette.primary.main,
          0.92,
        )} 100%)`,
        color: "common.white",
        border: "none",
      })}
    >
      <CardContent sx={{ p: { xs: 3, md: 5 } }}>
        <Stack spacing={3} sx={{ maxWidth: 860 }}>
          <Chip
            label={
              isAuthenticated
                ? t("home.authenticatedBadge")
                : t("home.publicBadge")
            }
            sx={(theme) => ({
              alignSelf: "flex-start",
              bgcolor: alpha(theme.palette.common.white, 0.14),
              color: theme.palette.common.white,
              border: `1px solid ${alpha(theme.palette.common.white, 0.18)}`,
            })}
          />

          <Stack spacing={1.5}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: "2.3rem", md: "3.6rem" },
                lineHeight: 1.02,
              }}
            >
              {isAuthenticated
                ? t("home.authenticatedTitle")
                : t("home.publicTitle")}
            </Typography>
            <Typography
              variant="h6"
              sx={(theme) => ({
                color: alpha(theme.palette.common.white, 0.78),
                textAlign: isAuthenticated ? "left" : "justify",
              })}
            >
              {isAuthenticated
                ? t("home.authenticatedSubtitle")
                : t("home.publicSubtitle")}
            </Typography>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            {isAuthenticated ? (
              <>
                <Button
                  component={RouterLink}
                  endIcon={<ArrowOutwardRoundedIcon />}
                  to={ROUTES.profile}
                  variant="contained"
                >
                  {t("home.ctaProfile")}
                </Button>
                {canManageQuestions ? (
                  <Button
                    component={RouterLink}
                    to={ROUTES.questions}
                    variant="outlined"
                    color="inherit"
                  >
                    {t("home.ctaQuestions")}
                  </Button>
                ) : null}
                {isAdmin ? (
                  <Button
                    component={RouterLink}
                    to={ROUTES.admin}
                    variant="outlined"
                    color="inherit"
                  >
                    {t("home.ctaAdmin")}
                  </Button>
                ) : null}
              </>
            ) : (
              <>
                <Button
                  component={RouterLink}
                  endIcon={<ArrowOutwardRoundedIcon />}
                  to={ROUTES.login}
                  variant="contained"
                >
                  {t("home.ctaLogin")}
                </Button>
                <Button
                  component={RouterLink}
                  to={ROUTES.register}
                  variant="outlined"
                  color="inherit"
                >
                  {t("home.ctaRegister")}
                </Button>
              </>
            )}
          </Stack>

          <Typography
            variant="body2"
            sx={(theme) => ({
              color: alpha(theme.palette.common.white, 0.64),
              textAlign: isAuthenticated ? "left" : "justify",
            })}
          >
            {isAuthenticated
              ? t("home.authenticatedSupportText")
              : t("home.publicSupportText")}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
