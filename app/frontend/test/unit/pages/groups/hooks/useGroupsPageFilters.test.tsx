import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useGroupsPageFilters } from "../../../../../src/pages/groups/hooks/useGroupsPageFilters";
import type { GroupItem } from "../../../../../src/types/group";

const groups: GroupItem[] = [
  {
    groupId: "group-1",
    name: "Grupo base",
    description: "Matemáticas",
    memberUserIds: [2],
    members: [
      {
        id: 2,
        fullName: "Ada Lovelace",
        email: "uo000002@uniovi.es",
        uo: "UO000002",
      },
    ],
    memberCount: 1,
    createdByUserId: 1,
    updatedByUserId: 1,
    version: 1,
    createdAt: "2026-04-17T10:00:00.000Z",
    updatedAt: "2026-04-17T10:00:00.000Z",
  },
  {
    groupId: "group-2",
    name: "Grupo física",
    description: "Laboratorio",
    memberUserIds: [3],
    members: [
      {
        id: 3,
        fullName: "Alan Turing",
        email: "uo000003@uniovi.es",
        uo: "UO000003",
      },
    ],
    memberCount: 1,
    createdByUserId: 1,
    updatedByUserId: 1,
    version: 1,
    createdAt: "2026-04-17T11:00:00.000Z",
    updatedAt: "2026-04-17T11:00:00.000Z",
  },
];

describe("useGroupsPageFilters", () => {
  it("filters by text and resets pagination when rows-per-page changes", () => {
    const { result } = renderHook(() => useGroupsPageFilters(groups));

    expect(result.current.filteredGroups).toHaveLength(2);
    expect(result.current.paginatedGroups).toHaveLength(2);

    act(() => {
      result.current.setSearch("ada");
    });

    expect(result.current.filteredGroups).toHaveLength(1);
    expect(result.current.filteredGroups[0]?.groupId).toBe("group-1");

    act(() => {
      result.current.handleRowsPerPageChange(1);
      result.current.setPage(1);
      result.current.setSearch("grupo");
    });

    expect(result.current.page).toBe(0);
    expect(result.current.rowsPerPage).toBe(1);
    expect(result.current.paginatedGroups).toHaveLength(1);
  });
});
