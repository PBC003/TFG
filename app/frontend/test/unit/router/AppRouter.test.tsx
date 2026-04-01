import { beforeEach, describe, expect, it, vi } from "vitest";

const createBrowserRouter = vi.fn((routes) => ({ routes }));

vi.mock("react-router-dom", () => ({
  createBrowserRouter,
}));

vi.mock("../../../src/components/layout/AppLayout", () => ({
  default: () => null,
}));

vi.mock("../../../src/components/auth/RequireAuth", () => ({
  RequireAuth: () => null,
}));

vi.mock("../../../src/components/auth/RequireGuest", () => ({
  RequireGuest: () => null,
}));

vi.mock("../../../src/components/auth/RequireRole", () => ({
  RequireRole: () => null,
}));

vi.mock("../../../src/pages/AboutPage", () => ({
  default: () => null,
}));

vi.mock("../../../src/pages/HomePage", () => ({
  default: () => null,
}));

vi.mock("../../../src/pages/LoginPage", () => ({
  default: () => null,
}));

vi.mock("../../../src/pages/NotFoundPage", () => ({
  default: () => null,
}));

vi.mock("../../../src/pages/profile/ProfilePage", () => ({
  default: () => null,
}));

vi.mock("../../../src/pages/RegisterPage", () => ({
  default: () => null,
}));

vi.mock("../../../src/pages/UnauthorizedPage", () => ({
  default: () => null,
}));

vi.mock("../../../src/pages/admin/AdminPage", () => ({
  default: () => null,
}));

vi.mock("../../../src/pages/questions/QuestionsPage", () => ({
  default: () => null,
}));

describe("router configuration", () => {
  beforeEach(() => {
    createBrowserRouter.mockClear();
  });

  it("registers the expected top-level and nested routes", async () => {
    const { router } = await import("../../../src/router/AppRouter");

    expect(createBrowserRouter).toHaveBeenCalledTimes(1);
    const routes = createBrowserRouter.mock.calls[0]?.[0];
    const root = routes?.[0];

    expect(router).toEqual({ routes });
    expect(root).toMatchObject({ path: "/" });
    expect(root.children).toHaveLength(8);

    expect(root.children[0]).toMatchObject({ index: true });
    expect(root.children[1]).toMatchObject({ path: "about" });
    expect(root.children[2].children[0]).toMatchObject({ path: "login" });
    expect(root.children[2].children[1]).toMatchObject({ path: "register" });
    expect(root.children[3].children[0]).toMatchObject({ path: "profile" });
    expect(root.children[4].children[0]).toMatchObject({ path: "admin" });
    expect(root.children[5].children[0]).toMatchObject({ path: "questions" });
    expect(root.children[6]).toMatchObject({ path: "unauthorized" });
    expect(root.children[7]).toMatchObject({ path: "*" });
  });
});
