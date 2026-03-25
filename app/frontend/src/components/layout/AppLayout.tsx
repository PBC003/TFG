import {
  AppBar,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CalculateRoundedIcon from "@mui/icons-material/CalculateRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { alpha } from "@mui/material/styles";
import { useMemo, useState } from "react";
import { Link as RouterLink, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import { ROUTES } from "../../constants/routes";
import { LanguageSwitcher } from "../common/LanguageSwitcher";
import { AppFooter } from "./AppFooter";

interface NavItem {
  label: string;
  to: string;
}

export default function AppLayout() {
  const { t } = useTranslation();
  const auth = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = useMemo<NavItem[]>(() => {
    const items: NavItem[] = [
      { label: t("nav.home"), to: ROUTES.home },
      { label: t("nav.about"), to: ROUTES.about },
    ];

    if (auth.isAuthenticated) {
      items.push({ label: t("nav.profile"), to: ROUTES.profile });

      if (auth.isAdmin) {
        items.push({ label: t("nav.admin"), to: ROUTES.admin });
      }

      return items;
    }

    items.push({ label: t("nav.login"), to: ROUTES.login });
    items.push({ label: t("nav.register"), to: ROUTES.register });
    return items;
  }, [auth.isAdmin, auth.isAuthenticated, t]);

  const toggleDrawer = () => {
    setMobileOpen((current) => !current);
  };

  const handleLogout = async () => {
    setMobileOpen(false);
    await auth.logout();
  };

  const isActiveRoute = (route: string) =>
    route === ROUTES.home
      ? location.pathname === route
      : location.pathname.startsWith(route);

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <AppBar position="sticky" elevation={0}>
        <Container>
          <Toolbar disableGutters sx={{ gap: 2, minHeight: 76 }}>
            <Stack
              component={RouterLink}
              direction="row"
              spacing={1.5}
              to={ROUTES.home}
              sx={{
                alignItems: "center",
                color: "inherit",
                flexGrow: 1,
                minWidth: 0,
              }}
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 2.5,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "rgba(255,255,255,0.14)",
                  border: `1px solid ${alpha("#FFFFFF", 0.18)}`,
                  flexShrink: 0,
                }}
              >
                <CalculateRoundedIcon />
              </Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, lineHeight: 1.15 }}
              >
                {t("common.appName")}
              </Typography>
            </Stack>

            <Stack
              direction="row"
              spacing={1}
              sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}
            >
              {navItems.map((item) => {
                const isActive = isActiveRoute(item.to);

                return (
                  <Button
                    key={item.to}
                    component={RouterLink}
                    to={item.to}
                    color="inherit"
                    sx={{
                      px: 1.75,
                      color: isActive ? "common.white" : alpha("#FFFFFF", 0.8),
                      bgcolor: isActive
                        ? alpha("#FFFFFF", 0.14)
                        : "transparent",
                      border: `1px solid ${isActive ? alpha("#FFFFFF", 0.18) : "transparent"}`,
                      "&:hover": {
                        bgcolor: alpha("#FFFFFF", 0.1),
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}

              <LanguageSwitcher />

              {auth.isAuthenticated ? (
                <Button
                  color="inherit"
                  onClick={handleLogout}
                  startIcon={<LogoutRoundedIcon />}
                  sx={{
                    color: alpha("#FFFFFF", 0.92),
                    border: `1px solid ${alpha("#FFFFFF", 0.16)}`,
                    "&:hover": {
                      bgcolor: alpha("#FFFFFF", 0.08),
                    },
                  }}
                >
                  {t("nav.logout")}
                </Button>
              ) : null}
            </Stack>

            <IconButton
              sx={{
                display: { xs: "inline-flex", md: "none" },
                color: "common.white",
                border: `1px solid ${alpha("#FFFFFF", 0.18)}`,
              }}
              onClick={toggleDrawer}
              edge="end"
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer anchor="right" open={mobileOpen} onClose={toggleDrawer}>
        <Box
          sx={{
            width: 300,
            height: "100%",
            p: 2.5,
            background:
              "linear-gradient(180deg, rgba(21,42,69,1) 0%, rgba(31,58,95,1) 100%)",
            color: "common.white",
          }}
        >
          <Stack spacing={2.5}>
            <Typography variant="h6" fontWeight={800}>
              {t("common.appName")}
            </Typography>

            <LanguageSwitcher />

            <List disablePadding sx={{ display: "grid", gap: 0.75 }}>
              {navItems.map((item) => {
                const isActive = isActiveRoute(item.to);

                return (
                  <ListItemButton
                    key={item.to}
                    component={RouterLink}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    sx={{
                      borderRadius: 2,
                      bgcolor: isActive
                        ? alpha("#FFFFFF", 0.14)
                        : "transparent",
                      border: `1px solid ${isActive ? alpha("#FFFFFF", 0.18) : "transparent"}`,
                    }}
                  >
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontWeight: isActive ? 700 : 500,
                      }}
                    />
                  </ListItemButton>
                );
              })}

              {auth.isAuthenticated ? (
                <ListItemButton
                  onClick={() => void handleLogout()}
                  sx={{
                    borderRadius: 2,
                    mt: 1,
                    border: `1px solid ${alpha("#FFFFFF", 0.16)}`,
                  }}
                >
                  <ListItemText primary={t("nav.logout")} />
                </ListItemButton>
              ) : null}
            </List>
          </Stack>
        </Box>
      </Drawer>

      <Container component="main" sx={{ flex: 1, py: { xs: 3, md: 5 } }}>
        <Outlet />
      </Container>

      <AppFooter />
    </Box>
  );
}
