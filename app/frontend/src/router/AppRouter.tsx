import { createBrowserRouter } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import { RequireAuth } from "../components/auth/RequireAuth";
import { RequireGuest } from "../components/auth/RequireGuest";
import { RequireRole } from "../components/auth/RequireRole";
import AboutPage from "../pages/AboutPage";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import NotFoundPage from "../pages/NotFoundPage";
import ProfilePage from "../pages/ProfilePage";
import RegisterPage from "../pages/RegisterPage";
import UnauthorizedPage from "../pages/UnauthorizedPage";
import AdminPage from "../pages/admin/AdminPage";
import QuestionsPage from "../pages/questions/QuestionsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "about",
        element: <AboutPage />,
      },
      {
        element: <RequireGuest />,
        children: [
          {
            path: "login",
            element: <LoginPage />,
          },
          {
            path: "register",
            element: <RegisterPage />,
          },
        ],
      },
      {
        element: <RequireAuth />,
        children: [
          {
            path: "profile",
            element: <ProfilePage />,
          },
        ],
      },
      {
        element: <RequireRole allowedRoles={["ADMIN"]} />,
        children: [
          {
            path: "admin",
            element: <AdminPage />,
          },
        ],
      },
      {
        element: <RequireRole allowedRoles={["ADMIN", "TEACHER"]} />,
        children: [
          {
            path: "questions",
            element: <QuestionsPage />,
          },
        ],
      },
      {
        path: "unauthorized",
        element: <UnauthorizedPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
