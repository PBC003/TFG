import { useCallback, useMemo, useState } from "react";
import type { GroupItem, GroupStudentOption } from "../../../types/group";

export function useGroupEditorState(
  groups: GroupItem[],
  ensureStudentsLoaded: () => Promise<void>,
) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<GroupItem | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<
    GroupStudentOption[]
  >([]);

  const normalizedName = name.trim();

  const duplicateNameExists = useMemo(() => {
    if (!normalizedName) {
      return false;
    }

    return groups.some(
      (group) =>
        group.name.trim().toLowerCase() === normalizedName.toLowerCase() &&
        group.groupId !== editingGroup?.groupId,
    );
  }, [editingGroup?.groupId, groups, normalizedName]);

  const resetEditor = useCallback(() => {
    setEditingGroup(null);
    setName("");
    setDescription("");
    setSelectedStudents([]);
  }, []);

  const openCreate = useCallback(() => {
    resetEditor();
    setEditorOpen(true);
    void ensureStudentsLoaded();
  }, [ensureStudentsLoaded, resetEditor]);

  const openEdit = useCallback(
    (group: GroupItem) => {
      setEditingGroup(group);
      setName(group.name);
      setDescription(group.description ?? "");
      setSelectedStudents(group.members);
      setEditorOpen(true);
      void ensureStudentsLoaded();
    },
    [ensureStudentsLoaded],
  );

  const closeEditor = useCallback(
    (isBlocked: boolean) => {
      if (isBlocked) {
        return;
      }

      setEditorOpen(false);
      resetEditor();
    },
    [resetEditor],
  );

  return {
    closeEditor,
    description,
    duplicateNameExists,
    editorOpen,
    editingGroup,
    name,
    normalizedName,
    openCreate,
    openEdit,
    resetEditor,
    selectedStudents,
    setDescription,
    setEditorOpen,
    setName,
    setSelectedStudents,
  };
}
