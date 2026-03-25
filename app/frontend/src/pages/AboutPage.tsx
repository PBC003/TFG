import {
  Box,
  Button,
  Card,
  CardContent,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={1.5}>
          <Typography component="h1" variant="h4">
            {t("about.hero.title")}
          </Typography>
          <Typography color="text.secondary" variant="body1">
            {t("about.hero.description")}
          </Typography>
        </Stack>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
        }}
      >
        <Card sx={{ height: "100%" }}>
          <CardContent>
            <Stack spacing={1.5}>
              <InfoOutlinedIcon color="primary" />
              <Typography variant="h6">
                {t("about.cards.what.title")}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                {t("about.cards.what.description")}
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ height: "100%" }}>
          <CardContent>
            <Stack spacing={1.5}>
              <SchoolOutlinedIcon color="primary" />
              <Typography variant="h6">
                {t("about.cards.goal.title")}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                {t("about.cards.goal.description")}
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ height: "100%" }}>
          <CardContent>
            <Stack spacing={1.5}>
              <BuildOutlinedIcon color="primary" />
              <Typography variant="h6">
                {t("about.cards.status.title")}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                {t("about.cards.status.description")}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={2}>
          <Typography variant="h6">{t("about.tech.title")}</Typography>

          <Typography color="text.secondary" variant="body2">
            {t("about.tech.p1")}
          </Typography>

          <Typography color="text.secondary" variant="body2">
            {t("about.tech.p2")}
          </Typography>

          <Box>
            <Button component={RouterLink} to="/" variant="contained">
              {t("about.backHome")}
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Stack>
  );
}
