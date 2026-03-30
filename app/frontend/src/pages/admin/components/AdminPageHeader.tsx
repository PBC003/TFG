import { Card, CardContent, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

export function AdminPageHeader() {
  const { t } = useTranslation();

  return (
    <Card>
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={1.5}>
          <Typography variant="h4" fontWeight={700}>
            {t("admin.title")}
          </Typography>
          <Typography color="text.secondary">{t("admin.subtitle")}</Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
