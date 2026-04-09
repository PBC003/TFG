import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { Button, Stack } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";
import { LanguageSwitcher } from "../../common/LanguageSwitcher";
import type { AppNavItem } from "../types/app-layout.types";

interface AppDesktopNavigationProps {
  isAuthenticated: boolean;
  isActiveRoute: (route: string) => boolean;
  navItems: AppNavItem[];
  onLogout: () => Promise<void>;
  logoutLabel: string;
}

export function AppDesktopNavigation({
  isAuthenticated,
  isActiveRoute,
  navItems,
  onLogout,
  logoutLabel,
}: AppDesktopNavigationProps) {
  return (
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
              bgcolor: isActive ? alpha("#FFFFFF", 0.14) : "transparent",
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

      {isAuthenticated ? (
        <Button
          color="inherit"
          onClick={() => void onLogout()}
          startIcon={<LogoutRoundedIcon />}
          sx={{
            color: alpha("#FFFFFF", 0.92),
            border: `1px solid ${alpha("#FFFFFF", 0.16)}`,
            "&:hover": {
              bgcolor: alpha("#FFFFFF", 0.08),
            },
          }}
        >
          {logoutLabel}
        </Button>
      ) : null}
    </Stack>
  );
}
