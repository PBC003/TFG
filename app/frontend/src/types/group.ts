export interface GroupStudentOption {
  id: number;
  fullName: string;
  email: string;
  uo: string;
}

export interface GroupItem {
  groupId: string;
  name: string;
  description: string | null;
  memberUserIds: number[];
  members: GroupStudentOption[];
  memberCount: number;
  createdByUserId: number;
  updatedByUserId: number;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGroupInput {
  name: string;
  description?: string | null;
  memberUserIds: number[];
}

export interface UpdateGroupInput {
  name?: string;
  description?: string | null;
  memberUserIds?: number[];
}

export interface GroupImportResult {
  matchedStudents: GroupStudentOption[];
  missingIdentifiers: string[];
  importedCount: number;
  matchedCount: number;
}
