export type GroupStudentOption = {
  id: number;
  fullName: string;
  email: string;
  uo: string;
};

export type GroupMemberItem = GroupStudentOption;

export type GroupItem = {
  groupId: string;
  name: string;
  description: string | null;
  memberUserIds: number[];
  members: GroupMemberItem[];
  memberCount: number;
  createdByUserId: number;
  updatedByUserId: number;
  version: number;
  createdAt: Date;
  updatedAt: Date;
};

export type GroupSummaryItem = {
  groupId: string;
  name: string;
};

export type GroupImportResult = {
  matchedStudents: GroupStudentOption[];
  missingIdentifiers: string[];
  importedCount: number;
  matchedCount: number;
};
