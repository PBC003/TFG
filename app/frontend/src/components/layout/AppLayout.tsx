import MenuIcon from "@mui/icons-material/Menu";
import { AppBar, Box, Container, IconButton, Toolbar } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Outlet } from "react-router-dom";
import { AppFooter } from "./AppFooter";
import { AppDesktopNavigation } from "./components/AppDesktopNavigation";
import { AppLayoutBrand } from "./components/AppLayoutBrand";
import { AppMobileNavigationDrawer } from "./components/AppMobileNavigationDrawer";
import { useAppLayoutNavigation } from "./hooks/useAppLayoutNavigation";

export default function AppLayout() {
  const {
    auth,
    mobileOpen,
    navItems,
    closeMobileNavigation,
    handleLogout,
    isActiveRoute,
    toggleMobileNavigation,
    t,
  } = useAppLayoutNavigation();

  const appName = t("common.appName");
  const logoutLabel = t("nav.logout");

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <AppBar position="sticky" elevation={0}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ gap: 2, minHeight: 76 }}>
            <AppLayoutBrand appName={appName} />

            <AppDesktopNavigation
              isAuthenticated={auth.isAuthenticated}
              isActiveRoute={isActiveRoute}
              navItems={navItems}
              onLogout={handleLogout}
              logoutLabel={logoutLabel}
            />

            <IconButton
              sx={{
                display: { xs: "inline-flex", md: "none" },
                color: "common.white",
                border: `1px solid ${alpha("#FFFFFF", 0.18)}`,
              }}
              onClick={toggleMobileNavigation}
              edge="end"
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      <AppMobileNavigationDrawer
        appName={appName}
        isAuthenticated={auth.isAuthenticated}
        isActiveRoute={isActiveRoute}
        navItems={navItems}
        onClose={closeMobileNavigation}
        onLogout={handleLogout}
        logoutLabel={logoutLabel}
        open={mobileOpen}
      />

      <Container
        maxWidth="lg"
        component="main"
        sx={{ flex: 1, py: { xs: 3, md: 5 } }}
      >
        <Outlet />
      </Container>

      <AppFooter />
    </Box>
  );
}
