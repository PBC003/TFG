import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import QuizRoundedIcon from "@mui/icons-material/QuizRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import ListAltRoundedIcon from "@mui/icons-material/ListAltRounded";
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import { ROUTES } from "../../constants/routes";
import { RoleChip } from "../common/RoleChip";
import { StatusChip } from "../common/StatusChip";

export function HomeAuthenticatedSection() {
  const { t } = useTranslation();
  const auth = useAuth();

  if (!auth.user) {
    return null;
  }

  const canManage = auth.user.role === "ADMIN" || auth.user.role === "TEACHER";

  const quickActions = canManage
    ? [
        {
          key: "questions",
          icon: QuizRoundedIcon,
          title: t("nav.questions"),
          description: t("questions.subtitle"),
          to: ROUTES.questions,
        },
        {
          key: "history",
          icon: HistoryRoundedIcon,
          title: t("nav.quizHistory"),
          description: t("quizHistory.subtitle"),
          to: ROUTES.quizHistory,
        },
        {
          key: "quizzes",
          icon: ListAltRoundedIcon,
          title: t("nav.quizzes"),
          description: t("quizzes.subtitle"),
          to: ROUTES.quizzes,
        },
        {
          key: "groups",
          icon: SchoolRoundedIcon,
          title: t("nav.groups"),
          description: t("groups.subtitle"),
          to: ROUTES.groups,
        },
      ]
    : [
        {
          key: "profile",
          icon: PersonRoundedIcon,
          title: t("nav.profile"),
          description: t("home.authenticatedOverviewBody"),
          to: ROUTES.profile,
        },
        {
          key: "history",
          icon: HistoryRoundedIcon,
          title: t("nav.quizHistory"),
          description: t("quizHistory.subtitle"),
          to: ROUTES.quizHistory,
        },
      ];

  return (
    <Stack spacing={3}>
      <Card>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack spacing={3}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 4,
                  bgcolor: "secondary.light",
                  color: "secondary.dark",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                <PersonRoundedIcon fontSize="large" />
              </Box>
              <Stack spacing={1} sx={{ flex: 1 }}>
                <Typography variant="h5" fontWeight={700}>
                  {t("home.authenticatedWelcome", {
                    name: auth.user.firstName,
                  })}
                </Typography>
                <Typography color="text.secondary">
                  {t("home.authenticatedSupportText")}
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  <RoleChip role={auth.user.role} />
                  <StatusChip isActive={auth.user.isActive} />
                </Stack>
              </Stack>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(2, minmax(0, 1fr))",
          },
        }}
      >
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Card key={action.key} sx={{ height: "100%" }}>
              <CardContent sx={{ p: { xs: 3, md: 3.5 } }}>
                <Stack spacing={2} sx={{ height: "100%" }}>
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
                    <Icon />
                  </Box>
                  <Stack spacing={0.75} sx={{ flex: 1 }}>
                    <Typography variant="h6">{action.title}</Typography>
                    <Typography color="text.secondary">
                      {action.description}
                    </Typography>
                  </Stack>
                  <Box>
                    <Button
                      component={RouterLink}
                      to={action.to}
                      variant="outlined"
                      endIcon={<ArrowOutwardRoundedIcon />}
                    >
                      {action.title}
                    </Button>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </Stack>
  );
}
