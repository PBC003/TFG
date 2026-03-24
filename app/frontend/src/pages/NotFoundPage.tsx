import { Button, Card, CardContent, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ROUTES } from "../constants/routes";

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <Card>
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={2}>
          <Typography variant="h4" fontWeight={700}>
            404
          </Typography>
          <Typography color="text.secondary">
            {t("errors.codes.common.not_found")}
          </Typography>
          <Button
            component={RouterLink}
            to={ROUTES.home}
            variant="contained"
            sx={{ alignSelf: "flex-start" }}
          >
            {t("nav.home")}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
