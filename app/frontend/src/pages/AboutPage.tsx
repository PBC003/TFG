import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import {
  Box,
  Button,
  Card,
  CardContent,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ROUTES } from "../constants/routes";

export default function AboutPage() {
  const { t } = useTranslation();

  const cards = [
    {
      icon: InfoOutlinedIcon,
      title: t("about.cards.what.title"),
      description: t("about.cards.what.description"),
    },
    {
      icon: SchoolOutlinedIcon,
      title: t("about.cards.goal.title"),
      description: t("about.cards.goal.description"),
    },
    {
      icon: BuildOutlinedIcon,
      title: t("about.cards.status.title"),
      description: t("about.cards.status.description"),
    },
  ];

  return (
    <Stack spacing={3}>
      <Paper variant="outlined" sx={{ p: { xs: 3, md: 5 }, borderRadius: 3 }}>
        <Stack spacing={1.5} sx={{ maxWidth: 860 }}>
          <Typography component="h1" variant="h3" fontWeight={800}>
            {t("about.hero.title")}
          </Typography>
          <Typography color="text.secondary" variant="body1">
            {t("about.hero.description")}
          </Typography>
          <Box>
            <Button
              component={RouterLink}
              to={ROUTES.quizAccess}
              variant="contained"
              endIcon={<ArrowOutwardRoundedIcon />}
            >
              {t("nav.quizAccess")}
            </Button>
          </Box>
        </Stack>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
        }}
      >
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} sx={{ height: "100%" }}>
              <CardContent sx={{ p: { xs: 3, md: 3.5 } }}>
                <Stack spacing={1.5}>
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
                    <Icon color="inherit" />
                  </Box>
                  <Typography variant="h6">{card.title}</Typography>
                  <Typography color="text.secondary" variant="body2">
                    {card.description}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight={700}>
            {t("about.tech.title")}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            {t("about.tech.p1")}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            {t("about.tech.p2")}
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
            <Button component={RouterLink} to={ROUTES.home} variant="outlined">
              {t("about.backHome")}
            </Button>
            <Button
              component={RouterLink}
              to={ROUTES.quizAccess}
              variant="contained"
            >
              {t("nav.quizAccess")}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}
