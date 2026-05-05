import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { Button, Menu, MenuItem, Stack } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useMemo, useState } from "react";
import type { MouseEvent } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const visibleItems = useMemo(
    () => navItems.filter((item) => item.desktopPlacement !== "overflow"),
    [navItems],
  );

  const overflowItems = useMemo(
    () => navItems.filter((item) => item.desktopPlacement === "overflow"),
    [navItems],
  );

  const isOverflowActive = overflowItems.some((item) => isActiveRoute(item.to));

  const handleOpenMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  return (
    <Stack
      direction="row"
      spacing={{ md: 0.25, lg: 0.5 }}
      sx={{
        display: { xs: "none", md: "flex" },
        alignItems: "center",
        ml: "auto",
        minWidth: 0,
        flexShrink: 1,
      }}
    >
      {visibleItems.map((item) => {
        const isActive = isActiveRoute(item.to);

        return (
          <Button
            key={item.to}
            component={RouterLink}
            to={item.to}
            color="inherit"
            sx={{
              minWidth: "auto",
              px: { md: 1, lg: 1.25 },
              whiteSpace: "nowrap",
              fontSize: { md: "0.875rem", lg: "0.9375rem" },
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

      {overflowItems.length > 0 ? (
        <>
          <Button
            color="inherit"
            endIcon={<KeyboardArrowDownRoundedIcon />}
            onClick={handleOpenMenu}
            sx={{
              minWidth: "auto",
              px: { md: 1, lg: 1.25 },
              whiteSpace: "nowrap",
              fontSize: { md: "0.875rem", lg: "0.9375rem" },
              color: isOverflowActive ? "common.white" : alpha("#FFFFFF", 0.8),
              bgcolor: isOverflowActive
                ? alpha("#FFFFFF", 0.14)
                : "transparent",
              border: `1px solid ${isOverflowActive ? alpha("#FFFFFF", 0.18) : "transparent"}`,
              "&:hover": {
                bgcolor: alpha("#FFFFFF", 0.1),
              },
            }}
          >
            {t("common.more")}
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
            keepMounted
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
          >
            {overflowItems.map((item) => (
              <MenuItem
                key={item.to}
                component={RouterLink}
                to={item.to}
                onClick={handleCloseMenu}
                selected={isActiveRoute(item.to)}
              >
                {item.label}
              </MenuItem>
            ))}
          </Menu>
        </>
      ) : null}

      <LanguageSwitcher />

      {isAuthenticated ? (
        <Button
          color="inherit"
          onClick={() => void onLogout()}
          startIcon={<LogoutRoundedIcon />}
          sx={{
            minWidth: "auto",
            px: { md: 1, lg: 1.25 },
            whiteSpace: "nowrap",
            fontSize: { md: "0.875rem", lg: "0.9375rem" },
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
