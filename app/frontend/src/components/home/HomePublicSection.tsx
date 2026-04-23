import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import CalculateRoundedIcon from "@mui/icons-material/CalculateRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import { useTranslation } from "react-i18next";

const publicItems = [
  {
    icon: CalculateRoundedIcon,
    titleKey: "home.publicFeaturePracticeTitle",
    bodyKey: "home.publicFeaturePracticeBody",
  },
  {
    icon: SchoolRoundedIcon,
    titleKey: "home.publicFeatureAccessTitle",
    bodyKey: "home.publicFeatureAccessBody",
  },
  {
    icon: MenuBookRoundedIcon,
    titleKey: "home.publicFeatureProfileTitle",
    bodyKey: "home.publicFeatureProfileBody",
  },
] as const;

export function HomePublicSection() {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: "grid",
        gap: 3,
        gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
      }}
    >
      {publicItems.map((item) => {
        const Icon = item.icon;

        return (
          <Card key={item.titleKey} sx={{ height: "100%" }}>
            <CardContent sx={{ p: { xs: 3, md: 3.5 } }}>
              <Stack spacing={2}>
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

                <Typography variant="h6">{t(item.titleKey)}</Typography>
                <Typography color="text.secondary">
                  {t(item.bodyKey)}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}
