import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useGroupEditorState } from "../../../../../src/pages/groups/hooks/useGroupEditorState";
import type { GroupItem } from "../../../../../src/types/group";

const groups: GroupItem[] = [
  {
    groupId: "group-1",
    name: "Grupo base",
    description: "Desc principal",
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
];

describe("useGroupEditorState", () => {
  it("opens create/edit modes, detects duplicates and closes only when allowed", () => {
    const ensureStudentsLoaded = vi.fn(async () => undefined);
    const { result } = renderHook(() =>
      useGroupEditorState(groups, ensureStudentsLoaded),
    );

    act(() => {
      result.current.openCreate();
    });

    expect(result.current.editorOpen).toBe(true);
    expect(ensureStudentsLoaded).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.setName("Grupo base");
    });

    expect(result.current.duplicateNameExists).toBe(true);

    act(() => {
      result.current.openEdit(groups[0]!);
    });

    expect(result.current.editingGroup?.groupId).toBe("group-1");
    expect(result.current.duplicateNameExists).toBe(false);

    act(() => {
      result.current.closeEditor(true);
    });

    expect(result.current.editorOpen).toBe(true);

    act(() => {
      result.current.closeEditor(false);
    });

    expect(result.current.editorOpen).toBe(false);
    expect(result.current.name).toBe("");
    expect(result.current.selectedStudents).toHaveLength(0);
  });
});
