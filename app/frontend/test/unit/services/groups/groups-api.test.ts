import { beforeEach, describe, expect, it, vi } from "vitest";
import { groupsApi } from "../../../../src/services/groups/groups-api";
import { request } from "../../../../src/services/http/api-client";

vi.mock("../../../../src/services/http/api-client", () => ({
  request: vi.fn(),
}));

describe("groupsApi", () => {
  beforeEach(() => {
    vi.mocked(request).mockReset();
  });

  it("calls the expected groups endpoints", () => {
    const payload = {
      name: "Grupo A",
      description: "Primer grupo",
      memberUserIds: [1, 2],
    };

    groupsApi.listGroups("token");
    groupsApi.listStudentOptions("token");
    groupsApi.createGroup("token", payload);
    groupsApi.updateGroup("token", "group-1", { name: "Grupo B" });
    groupsApi.archiveGroup("token", "group-1");
    groupsApi.importMembers("token", "uo000001@uniovi.es");

    expect(request).toHaveBeenNthCalledWith(1, "/groups", {
      accessToken: "token",
    });
    expect(request).toHaveBeenNthCalledWith(2, "/groups/student-options", {
      accessToken: "token",
    });
    expect(request).toHaveBeenNthCalledWith(3, "/groups", {
      method: "POST",
      accessToken: "token",
      body: payload,
    });
    expect(request).toHaveBeenNthCalledWith(4, "/groups/group-1", {
      method: "PATCH",
      accessToken: "token",
      body: { name: "Grupo B" },
    });
    expect(request).toHaveBeenNthCalledWith(5, "/groups/group-1", {
      method: "DELETE",
      accessToken: "token",
    });
    expect(request).toHaveBeenNthCalledWith(6, "/groups/import-members", {
      method: "POST",
      accessToken: "token",
      body: { rawText: "uo000001@uniovi.es" },
    });
  });
});
