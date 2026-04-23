import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../hooks/useAuth";
import { groupsApi } from "../../../services/groups/groups-api";
import type {
  CreateGroupInput,
  GroupItem,
  GroupStudentOption,
  UpdateGroupInput,
} from "../../../types/group";
import { getErrorMessage } from "../../../utils/error-code";
import { useGroupEditorState } from "./useGroupEditorState";
import {
  useGroupMembersImport,
  type GroupImportFeedback,
} from "./useGroupMembersImport";
import { useGroupsPageFilters } from "./useGroupsPageFilters";

export type GroupsPageFeedback = GroupImportFeedback;

export function useGroupsPage() {
  const { t, i18n } = useTranslation();
  const auth = useAuth();
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [students, setStudents] = useState<GroupStudentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentLoading, setStudentLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<GroupsPageFeedback | null>(null);

  const refreshGroups = useCallback(
    async (successMessage?: string) => {
      setLoading(true);

      try {
        const response = await auth.executeWithSession((token) =>
          groupsApi.listGroups(token),
        );
        setGroups(response.groups);

        if (successMessage) {
          setFeedback({ severity: "success", message: successMessage });
        }
      } catch (error) {
        setFeedback({ severity: "error", message: getErrorMessage(t, error) });
      } finally {
        setLoading(false);
      }
    },
    [auth, t],
  );

  const ensureStudentsLoaded = useCallback(async () => {
    if (students.length > 0 || studentLoading) {
      return;
    }

    setStudentLoading(true);

    try {
      const response = await auth.executeWithSession((token) =>
        groupsApi.listStudentOptions(token),
      );
      setStudents(response.students);
    } catch (error) {
      setFeedback({ severity: "error", message: getErrorMessage(t, error) });
    } finally {
      setStudentLoading(false);
    }
  }, [auth, studentLoading, students.length, t]);

  useEffect(() => {
    void refreshGroups();
  }, [refreshGroups]);

  const filters = useGroupsPageFilters(groups);

  const editor = useGroupEditorState(groups, ensureStudentsLoaded);

  const mergeSelectedStudents = useCallback(
    (nextStudents: GroupStudentOption[]) => {
      editor.setSelectedStudents((current) => {
        const merged = new Map(current.map((student) => [student.id, student]));

        nextStudents.forEach((student) => {
          merged.set(student.id, student);
        });

        return Array.from(merged.values()).sort((left, right) =>
          left.fullName.localeCompare(right.fullName, i18n.language),
        );
      });

      setStudents((current) => {
        const merged = new Map(current.map((student) => [student.id, student]));

        nextStudents.forEach((student) => {
          merged.set(student.id, student);
        });

        return Array.from(merged.values()).sort((left, right) =>
          left.fullName.localeCompare(right.fullName, i18n.language),
        );
      });
    },
    [editor, i18n.language],
  );

  const groupImport = useGroupMembersImport({
    importMembers: async (rawText) => {
      const response = await auth.executeWithSession((token) =>
        groupsApi.importMembers(token, rawText),
      );
      return response.result;
    },
    mergeSelectedStudents,
    onFeedback: setFeedback,
    onReadError: (message) => {
      setFeedback({ severity: "error", message });
    },
    t,
  });

  const closeEditor = useCallback(() => {
    editor.closeEditor(submitting || groupImport.importingMembers);
    if (!(submitting || groupImport.importingMembers)) {
      groupImport.resetImportedContent();
    }
  }, [editor, groupImport, submitting]);

  const openCreate = useCallback(() => {
    groupImport.resetImportedContent();
    editor.openCreate();
  }, [editor, groupImport]);

  const openEdit = useCallback(
    (group: GroupItem) => {
      groupImport.resetImportedContent();
      editor.openEdit(group);
    },
    [editor, groupImport],
  );

  const submitEditor = useCallback(async () => {
    const payload: CreateGroupInput | UpdateGroupInput = {
      name: editor.normalizedName,
      description: editor.description.trim() || null,
      memberUserIds: editor.selectedStudents.map((student) => student.id),
    };

    if (!payload.name) {
      setFeedback({ severity: "info", message: t("groups.validation.name") });
      return;
    }

    if (payload.name.length < 3) {
      setFeedback({
        severity: "info",
        message: t("groups.validation.nameLength"),
      });
      return;
    }

    if (editor.duplicateNameExists) {
      setFeedback({
        severity: "info",
        message: t("errors.codes.group.name_already_exists"),
      });
      return;
    }

    setSubmitting(true);

    try {
      if (editor.editingGroup) {
        const editingGroupId = editor.editingGroup.groupId;
        const response = await auth.executeWithSession((token) =>
          groupsApi.updateGroup(token, editingGroupId, payload),
        );
        setGroups((current) =>
          current.map((group) =>
            group.groupId === response.group.groupId ? response.group : group,
          ),
        );
        setFeedback({
          severity: "success",
          message: t("groups.updateSuccess"),
        });
      } else {
        const response = await auth.executeWithSession((token) =>
          groupsApi.createGroup(token, payload as CreateGroupInput),
        );
        setGroups((current) => [response.group, ...current]);
        setFeedback({
          severity: "success",
          message: t("groups.createSuccess"),
        });
      }

      editor.setEditorOpen(false);
      editor.resetEditor();
      groupImport.resetImportedContent();
    } catch (error) {
      setFeedback({ severity: "error", message: getErrorMessage(t, error) });
    } finally {
      setSubmitting(false);
    }
  }, [auth, editor, groupImport, t]);

  const archiveGroup = useCallback(
    async (group: GroupItem) => {
      const confirmed = window.confirm(
        t("groups.confirmArchive", { title: group.name }),
      );

      if (!confirmed) {
        return;
      }

      setSubmitting(true);

      try {
        await auth.executeWithSession((token) =>
          groupsApi.archiveGroup(token, group.groupId),
        );
        setGroups((current) =>
          current.filter((item) => item.groupId !== group.groupId),
        );
        setFeedback({
          severity: "success",
          message: t("groups.archiveSuccess"),
        });
      } catch (error) {
        setFeedback({ severity: "error", message: getErrorMessage(t, error) });
      } finally {
        setSubmitting(false);
      }
    },
    [auth, t],
  );

  return {
    archiveGroup,
    closeEditor,
    description: editor.description,
    duplicateNameExists: editor.duplicateNameExists,
    editorOpen: editor.editorOpen,
    editingGroup: editor.editingGroup,
    feedback,
    filteredGroups: filters.filteredGroups,
    handleImportFile: groupImport.handleImportFile,
    handleRowsPerPageChange: filters.handleRowsPerPageChange,
    importFileKey: groupImport.importFileKey,
    importMembersFromRawText: groupImport.importMembersFromRawText,
    importRawText: groupImport.importRawText,
    importingMembers: groupImport.importingMembers,
    loading,
    name: editor.name,
    normalizedName: editor.normalizedName,
    openCreate,
    openEdit,
    page: filters.page,
    paginatedGroups: filters.paginatedGroups,
    refreshGroups,
    rowsPerPage: filters.rowsPerPage,
    search: filters.search,
    selectedStudents: editor.selectedStudents,
    setDescription: editor.setDescription,
    setFeedback,
    setImportRawText: groupImport.setImportRawText,
    setName: editor.setName,
    setPage: filters.setPage,
    setSearch: filters.setSearch,
    setSelectedStudents: editor.setSelectedStudents,
    studentLoading,
    students,
    submitEditor,
    submitting,
  };
}
