import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";
import { LanguageSwitcher } from "../../common/LanguageSwitcher";
import type { AppNavItem } from "../types/app-layout.types";

interface AppMobileNavigationDrawerProps {
  appName: string;
  isAuthenticated: boolean;
  isActiveRoute: (route: string) => boolean;
  navItems: AppNavItem[];
  onClose: () => void;
  onLogout: () => Promise<void>;
  logoutLabel: string;
  open: boolean;
}

export function AppMobileNavigationDrawer({
  appName,
  isAuthenticated,
  isActiveRoute,
  navItems,
  onClose,
  onLogout,
  logoutLabel,
  open,
}: AppMobileNavigationDrawerProps) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
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
            {appName}
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
                  onClick={onClose}
                  sx={{
                    borderRadius: 2,
                    bgcolor: isActive ? alpha("#FFFFFF", 0.14) : "transparent",
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

            {isAuthenticated ? (
              <ListItemButton
                onClick={() => void onLogout()}
                sx={{
                  borderRadius: 2,
                  mt: 1,
                  border: `1px solid ${alpha("#FFFFFF", 0.16)}`,
                }}
              >
                <ListItemText primary={logoutLabel} />
              </ListItemButton>
            ) : null}
          </List>
        </Stack>
      </Box>
    </Drawer>
  );
}
