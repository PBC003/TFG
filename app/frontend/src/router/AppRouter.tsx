import {
  lazy,
  Suspense,
  type ComponentType,
  type LazyExoticComponent,
} from "react";
import { createBrowserRouter } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import { RequireAuth } from "../components/auth/RequireAuth";
import { RequireGuest } from "../components/auth/RequireGuest";
import { RequireRole } from "../components/auth/RequireRole";
import AboutPage from "../pages/AboutPage";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import NotFoundPage from "../pages/NotFoundPage";
import ProfilePage from "../pages/profile/ProfilePage";
import RegisterPage from "../pages/RegisterPage";
import UnauthorizedPage from "../pages/UnauthorizedPage";

const AdminPage = lazy(() => import("../pages/admin/AdminPage"));
const QuestionsPage = lazy(() => import("../pages/questions/QuestionsPage"));
const QuizzesPage = lazy(() => import("../pages/quizzes/QuizzesPage"));
const QuizAccessPage = lazy(
  () => import("../pages/quiz-access/QuizAccessPage"),
);
const QuizHistoryPage = lazy(
  () => import("../pages/quiz-history/QuizHistoryPage"),
);
const QuizAnalyticsPage = lazy(
  () => import("../pages/quizzes/QuizAnalyticsPage"),
);
const QuizSimulationPage = lazy(
  () => import("../pages/quizzes/QuizSimulationPage"),
);
const GroupsPage = lazy(() => import("../pages/groups/GroupsPage"));

type LazyPageComponent = LazyExoticComponent<ComponentType>;

function renderLazyPage(PageComponent: LazyPageComponent) {
  return (
    <Suspense fallback={null}>
      <PageComponent />
    </Suspense>
  );
}

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
        element: <RequireAuth />,
        children: [
          {
            path: "quiz-access",
            element: renderLazyPage(QuizAccessPage),
          },
          {
            path: "quiz-access/:quizId",
            element: renderLazyPage(QuizAccessPage),
          },
        ],
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
          {
            path: "quiz-history",
            element: renderLazyPage(QuizHistoryPage),
          },
        ],
      },
      {
        element: <RequireRole allowedRoles={["ADMIN"]} />,
        children: [
          {
            path: "admin",
            element: renderLazyPage(AdminPage),
          },
        ],
      },
      {
        element: <RequireRole allowedRoles={["ADMIN", "TEACHER"]} />,
        children: [
          {
            path: "questions",
            element: renderLazyPage(QuestionsPage),
          },
          {
            path: "groups",
            element: renderLazyPage(GroupsPage),
          },
          {
            path: "quizzes",
            element: renderLazyPage(QuizzesPage),
          },
          {
            path: "quizzes/:quizId/simulate",
            element: renderLazyPage(QuizSimulationPage),
          },
          {
            path: "quizzes/:quizId/analytics",
            element: renderLazyPage(QuizAnalyticsPage),
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
