import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import GroupsPage from "../../../../src/pages/groups/GroupsPage";
import { AuthContext } from "../../../../src/context/AuthContext";
import { createAuthValue } from "../../../utils/auth";
import { groupsApi } from "../../../../src/services/groups/groups-api";

vi.mock("../../../../src/services/groups/groups-api", () => ({
  groupsApi: {
    listGroups: vi.fn(),
    listStudentOptions: vi.fn(),
    createGroup: vi.fn(),
    updateGroup: vi.fn(),
    archiveGroup: vi.fn(),
    importMembers: vi.fn(),
  },
}));

vi.mock("../../../../src/utils/date", () => ({
  formatDateTime: () => "formatted-date",
}));

vi.mock("../../../../src/utils/error-code", () => ({
  getErrorMessage: (_t: unknown, error: unknown) =>
    error instanceof Error ? error.message : "unknown-error",
}));

const authValue = createAuthValue();

const studentOptions = [
  {
    id: 2,
    fullName: "Ada Lovelace",
    email: "uo000002@uniovi.es",
    uo: "UO000002",
  },
  {
    id: 3,
    fullName: "Alan Turing",
    email: "uo000003@uniovi.es",
    uo: "UO000003",
  },
  {
    id: 4,
    fullName: "Grace Hopper",
    email: "uo000004@uniovi.es",
    uo: "UO000004",
  },
  {
    id: 5,
    fullName: "Edsger Dijkstra",
    email: "uo000005@uniovi.es",
    uo: "UO000005",
  },
];

const baseGroup = {
  groupId: "group-1",
  name: "Grupo base",
  description: "Desc principal",
  memberUserIds: [2, 3, 4, 5],
  members: studentOptions,
  memberCount: 4,
  createdByUserId: 1,
  updatedByUserId: 1,
  version: 1,
  createdAt: "2026-04-17T10:00:00.000Z",
  updatedAt: "2026-04-17T10:00:00.000Z",
};

const secondGroup = {
  groupId: "group-2",
  name: "Grupo física",
  description: "Desc secundaria",
  memberUserIds: [3],
  members: [studentOptions[1]],
  memberCount: 1,
  createdByUserId: 1,
  updatedByUserId: 1,
  version: 1,
  createdAt: "2026-04-17T11:00:00.000Z",
  updatedAt: "2026-04-17T11:00:00.000Z",
};

function renderPage() {
  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter>
        <GroupsPage />
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

async function waitForListReady() {
  await waitFor(() => {
    expect(screen.queryByText("common.loading")).not.toBeInTheDocument();
  });

  await screen.findAllByRole("button", { name: "common.edit" });
}

describe("GroupsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      "confirm",
      vi.fn(() => true),
    );

    vi.mocked(groupsApi.listGroups).mockResolvedValue({
      groups: [baseGroup, secondGroup],
    });

    vi.mocked(groupsApi.listStudentOptions).mockResolvedValue({
      students: studentOptions,
    });

    vi.mocked(groupsApi.createGroup).mockResolvedValue({
      group: {
        ...baseGroup,
        groupId: "group-3",
        name: "Grupo nuevo",
        description: "Nueva descripción",
        members: [],
        memberUserIds: [],
        memberCount: 0,
      },
    });

    vi.mocked(groupsApi.updateGroup).mockResolvedValue({
      group: {
        ...baseGroup,
        name: "Grupo base editado",
        description: "Descripción editada",
      },
    });

    vi.mocked(groupsApi.archiveGroup).mockResolvedValue(undefined);
  });

  it("renders loaded groups, filters them and refreshes", async () => {
    renderPage();

    expect(screen.getByText("common.loading")).toBeInTheDocument();

    await waitForListReady();

    expect(screen.getByText("Grupo base")).toBeInTheDocument();
    expect(screen.getByText("Desc principal")).toBeInTheDocument();
    expect(screen.getAllByText("formatted-date")).toHaveLength(2);
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("groups.search"), {
      target: { value: "física" },
    });
    expect(await screen.findByText("Grupo física")).toBeInTheDocument();
    expect(screen.queryByText("Grupo base")).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("groups.search"), {
      target: { value: "ada lovelace" },
    });
    expect(await screen.findByText("Grupo base")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("groups.search"), {
      target: { value: "sin resultados" },
    });
    expect(await screen.findByText("groups.empty")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("groups.search"), {
      target: { value: "" },
    });

    await waitForListReady();

    fireEvent.click(screen.getByRole("button", { name: "common.refresh" }));

    await waitFor(() => {
      expect(groupsApi.listGroups).toHaveBeenCalledTimes(2);
    });
  }, 15000);

  it("validates and creates a group", async () => {
    renderPage();
    await waitForListReady();

    fireEvent.click(
      screen.getByRole("button", { name: "groups.createAction" }),
    );

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("groups.createTitle")).toBeInTheDocument();

    fireEvent.click(
      within(dialog).getByRole("button", { name: "common.create" }),
    );
    expect(
      await screen.findByText("groups.validation.name"),
    ).toBeInTheDocument();

    fireEvent.change(
      within(dialog).getByRole("textbox", { name: "groups.fields.name" }),
      { target: { value: "ab" } },
    );
    fireEvent.click(
      within(dialog).getByRole("button", { name: "common.create" }),
    );
    expect(
      await screen.findByText("groups.validation.nameLength"),
    ).toBeInTheDocument();

    fireEvent.change(
      within(dialog).getByRole("textbox", { name: "groups.fields.name" }),
      { target: { value: "Grupo base" } },
    );
    expect(
      await within(dialog).findByText("errors.codes.group.name_already_exists"),
    ).toBeInTheDocument();

    fireEvent.change(
      within(dialog).getByRole("textbox", { name: "groups.fields.name" }),
      { target: { value: "  Grupo nuevo  " } },
    );
    fireEvent.change(
      within(dialog).getByRole("textbox", {
        name: "groups.fields.description",
      }),
      { target: { value: "  Nueva descripción  " } },
    );

    fireEvent.click(
      within(dialog).getByRole("button", { name: "common.create" }),
    );

    await waitFor(() => {
      expect(groupsApi.createGroup).toHaveBeenCalledWith("token", {
        name: "Grupo nuevo",
        description: "Nueva descripción",
        memberUserIds: [],
      });
    });

    expect(await screen.findByText("groups.createSuccess")).toBeInTheDocument();
    expect(await screen.findByText("Grupo nuevo")).toBeInTheDocument();
  }, 15000);

  it("edits and archives a group", async () => {
    renderPage();
    await waitForListReady();

    fireEvent.click(screen.getAllByRole("button", { name: "common.edit" })[0]);

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("groups.editTitle")).toBeInTheDocument();
    expect(within(dialog).getByDisplayValue("Grupo base")).toBeInTheDocument();
    expect(
      within(dialog).getByDisplayValue("Desc principal"),
    ).toBeInTheDocument();

    fireEvent.change(
      within(dialog).getByRole("textbox", { name: "groups.fields.name" }),
      { target: { value: "  Grupo base editado  " } },
    );
    fireEvent.change(
      within(dialog).getByRole("textbox", {
        name: "groups.fields.description",
      }),
      { target: { value: "  Descripción editada  " } },
    );

    fireEvent.click(
      within(dialog).getByRole("button", { name: "common.save" }),
    );

    await waitFor(() => {
      expect(groupsApi.updateGroup).toHaveBeenCalledWith("token", "group-1", {
        name: "Grupo base editado",
        description: "Descripción editada",
        memberUserIds: [2, 3, 4, 5],
      });
    });

    expect(await screen.findByText("groups.updateSuccess")).toBeInTheDocument();
    expect(await screen.findByText("Grupo base editado")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    const confirmMock = vi.fn(() => false);
    vi.stubGlobal("confirm", confirmMock);

    fireEvent.click(
      screen.getAllByRole("button", { name: "groups.archiveAction" })[0],
    );

    expect(confirmMock).toHaveBeenCalledTimes(1);
    expect(groupsApi.archiveGroup).not.toHaveBeenCalled();

    vi.stubGlobal(
      "confirm",
      vi.fn(() => true),
    );

    fireEvent.click(
      screen.getAllByRole("button", { name: "groups.archiveAction" })[0],
    );

    await waitFor(() => {
      expect(groupsApi.archiveGroup).toHaveBeenCalledWith("token", "group-1");
    });

    expect(
      await screen.findByText("groups.archiveSuccess"),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText("Grupo base editado")).not.toBeInTheDocument();
    });
  }, 15000);

  it("imports members from pasted csv-like text", async () => {
    vi.mocked(groupsApi.importMembers).mockResolvedValueOnce({
      result: {
        matchedStudents: [
          {
            id: 2,
            fullName: "Ada Lovelace",
            email: "uo000002@uniovi.es",
            uo: "UO000002",
          },
        ],
        missingIdentifiers: ["UO000099"],
        importedCount: 2,
        matchedCount: 1,
      },
    });

    renderPage();
    await waitForListReady();

    fireEvent.click(
      screen.getByRole("button", { name: "groups.createAction" }),
    );

    const dialog = await screen.findByRole("dialog");
    fireEvent.change(
      within(dialog).getByRole("textbox", {
        name: "groups.import.rawTextLabel",
      }),
      { target: { value: "uo000002@uniovi.es\nUO000099" } },
    );
    fireEvent.click(
      within(dialog).getByRole("button", {
        name: "groups.import.importAction",
      }),
    );

    await waitFor(() => {
      expect(groupsApi.importMembers).toHaveBeenCalledWith(
        "token",
        "uo000002@uniovi.es\nUO000099",
      );
    });

    expect(
      await screen.findByText("groups.import.partialSuccess"),
    ).toBeInTheDocument();
  }, 15000);

  it("shows load and mutation errors", async () => {
    vi.mocked(groupsApi.listGroups).mockRejectedValueOnce(
      new Error("load failed"),
    );

    const firstRender = renderPage();

    expect(await screen.findByText("load failed")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText("common.loading")).not.toBeInTheDocument();
    });

    expect(screen.getByText("groups.empty")).toBeInTheDocument();

    firstRender.unmount();

    vi.mocked(groupsApi.listGroups).mockResolvedValueOnce({
      groups: [baseGroup],
    });

    renderPage();
    await waitForListReady();

    vi.mocked(groupsApi.listStudentOptions).mockRejectedValueOnce(
      new Error("students failed"),
    );

    fireEvent.click(
      screen.getByRole("button", { name: "groups.createAction" }),
    );

    expect(await screen.findByText("students failed")).toBeInTheDocument();

    let dialog = await screen.findByRole("dialog");

    fireEvent.change(
      within(dialog).getByRole("textbox", { name: "groups.fields.name" }),
      { target: { value: "Grupo temporal" } },
    );

    vi.mocked(groupsApi.createGroup).mockRejectedValueOnce(
      new Error("create failed"),
    );

    fireEvent.click(
      within(dialog).getByRole("button", { name: "common.create" }),
    );

    expect(await screen.findByText("create failed")).toBeInTheDocument();

    fireEvent.click(
      within(dialog).getByRole("button", { name: "common.cancel" }),
    );

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByRole("button", { name: "common.edit" })[0]);

    dialog = await screen.findByRole("dialog");

    vi.mocked(groupsApi.updateGroup).mockRejectedValueOnce(
      new Error("update failed"),
    );

    fireEvent.click(
      within(dialog).getByRole("button", { name: "common.save" }),
    );

    expect(await screen.findByText("update failed")).toBeInTheDocument();

    fireEvent.click(
      within(dialog).getByRole("button", { name: "common.cancel" }),
    );

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    vi.mocked(groupsApi.archiveGroup).mockRejectedValueOnce(
      new Error("archive failed"),
    );

    fireEvent.click(
      screen.getAllByRole("button", { name: "groups.archiveAction" })[0],
    );

    expect(await screen.findByText("archive failed")).toBeInTheDocument();
  }, 15000);
});
