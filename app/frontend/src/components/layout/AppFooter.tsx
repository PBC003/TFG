import { Box, Container, Link, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

const UNIVERSITY_URL = "https://www.uniovi.es/";
const REPOSITORY_URL = "https://github.com/PBC003/TFG";
const AUTHOR_UO = "UO289642";

export function AppFooter() {
  const { t } = useTranslation();

  return (
    <Box
      component="footer"
      sx={(theme) => ({
        mt: 4,
        color: "common.white",
        backgroundColor: theme.palette.primary.dark,
        borderTop: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
      })}
    >
      <Container
        maxWidth="xl"
        sx={{
          py: { xs: 1.5, md: 1.75 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0.6,
            textAlign: "center",
          }}
        >
          <Typography
            variant="body2"
            fontWeight={800}
            sx={{
              letterSpacing: 0.2,
            }}
          >
            {t("common.appName")}
          </Typography>

          <Box
            sx={{
              width: "100%",
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "minmax(0, 1fr) auto minmax(0, 1fr)",
              },
              alignItems: "center",
              rowGap: 0.35,
              columnGap: 2,
            }}
          >
            <Box
              sx={{
                minWidth: 0,
                textAlign: { xs: "center", sm: "right" },
              }}
            >
              <Link
                color="inherit"
                href={UNIVERSITY_URL}
                rel="noreferrer"
                target="_blank"
                underline="hover"
                variant="caption"
                sx={(theme) => ({
                  color: alpha(theme.palette.common.white, 0.86),
                  fontWeight: 500,
                })}
              >
                {t("footer.university")}
              </Link>
            </Box>

            <Box
              sx={{
                textAlign: "center",
                px: { sm: 0.5 },
              }}
            >
              <Typography
                variant="caption"
                sx={(theme) => ({
                  color: alpha(theme.palette.common.white, 0.72),
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                })}
              >
                {AUTHOR_UO}
              </Typography>
            </Box>

            <Box
              sx={{
                minWidth: 0,
                textAlign: { xs: "center", sm: "left" },
              }}
            >
              <Link
                color="inherit"
                href={REPOSITORY_URL}
                rel="noreferrer"
                target="_blank"
                underline="hover"
                variant="caption"
                sx={(theme) => ({
                  color: alpha(theme.palette.common.white, 0.86),
                  fontWeight: 500,
                })}
              >
                {t("footer.repository")}
              </Link>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
