import type {
  CreateGroupInput,
  GroupImportResult,
  GroupItem,
  GroupStudentOption,
  UpdateGroupInput,
} from "../../types/group";
import { request } from "../http/api-client";

export const groupsApi = {
  listGroups(accessToken: string) {
    return request<{ groups: GroupItem[] }>("/groups", {
      accessToken,
    });
  },
  listStudentOptions(accessToken: string) {
    return request<{ students: GroupStudentOption[] }>(
      "/groups/student-options",
      {
        accessToken,
      },
    );
  },
  createGroup(accessToken: string, payload: CreateGroupInput) {
    return request<{ group: GroupItem }>("/groups", {
      method: "POST",
      accessToken,
      body: payload,
    });
  },
  importMembers(accessToken: string, rawText: string) {
    return request<{ result: GroupImportResult }>("/groups/import-members", {
      method: "POST",
      accessToken,
      body: { rawText },
    });
  },
  updateGroup(accessToken: string, groupId: string, payload: UpdateGroupInput) {
    return request<{ group: GroupItem }>(`/groups/${groupId}`, {
      method: "PATCH",
      accessToken,
      body: payload,
    });
  },
  archiveGroup(accessToken: string, groupId: string) {
    return request<void>(`/groups/${groupId}`, {
      method: "DELETE",
      accessToken,
    });
  },
};
