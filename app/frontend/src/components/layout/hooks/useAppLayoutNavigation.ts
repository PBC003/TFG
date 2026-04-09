import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ROUTES } from "../../../constants/routes";
import { useAuth } from "../../../hooks/useAuth";
import type { AppNavItem } from "../types/app-layout.types";

function buildNavItems(
  isAuthenticated: boolean,
  isAdmin: boolean,
  role: string | undefined,
  t: (key: string) => string,
): AppNavItem[] {
  const items: AppNavItem[] = [
    { label: t("nav.home"), to: ROUTES.home },
    { label: t("nav.about"), to: ROUTES.about },
  ];

  if (!isAuthenticated) {
    items.push({ label: t("nav.login"), to: ROUTES.login });
    items.push({ label: t("nav.register"), to: ROUTES.register });
    return items;
  }

  items.push({ label: t("nav.profile"), to: ROUTES.profile });

  if (role === "ADMIN" || role === "TEACHER") {
    items.push({ label: t("nav.questions"), to: ROUTES.questions });
  }

  if (isAdmin) {
    items.push({ label: t("nav.admin"), to: ROUTES.admin });
  }

  return items;
}

export function useAppLayoutNavigation() {
  const { t } = useTranslation();
  const auth = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = useMemo(
    () =>
      buildNavItems(
        auth.isAuthenticated,
        auth.isAdmin,
        auth.user?.role,
        (key) => t(key),
      ),
    [auth.isAdmin, auth.isAuthenticated, auth.user?.role, t],
  );

  const toggleMobileNavigation = () => {
    setMobileOpen((current) => !current);
  };

  const closeMobileNavigation = () => {
    setMobileOpen(false);
  };

  const isActiveRoute = (route: string) =>
    route === ROUTES.home
      ? location.pathname === route
      : location.pathname.startsWith(route);

  const handleLogout = async () => {
    closeMobileNavigation();
    await auth.logout();
  };

  return {
    auth,
    mobileOpen,
    navItems,
    closeMobileNavigation,
    handleLogout,
    isActiveRoute,
    toggleMobileNavigation,
    t,
  };
}
