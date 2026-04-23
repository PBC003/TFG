import type { User } from '../../users/entities/user.entity';
import type { GroupDocument } from '../schemas/group.schema';
import type {
  GroupItem,
  GroupStudentOption,
  GroupSummaryItem,
} from '../types/group.types';

function toStudentOption(
  user: Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'uo'>,
): GroupStudentOption {
  return {
    id: user.id,
    fullName: `${user.firstName} ${user.lastName}`.trim(),
    email: user.email,
    uo: user.uo,
  };
}

export function toGroupItem(
  group: GroupDocument,
  studentsById: Map<
    number,
    Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'uo'>
  >,
): GroupItem {
  const members = group.memberUserIds
    .map((userId) => studentsById.get(userId))
    .filter(
      (
        user,
      ): user is Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'uo'> =>
        Boolean(user),
    )
    .map(toStudentOption);

  return {
    groupId: group.groupId,
    name: group.name,
    description: group.description,
    memberUserIds: [...group.memberUserIds],
    members,
    memberCount: members.length,
    createdByUserId: group.createdByUserId,
    updatedByUserId: group.updatedByUserId,
    version: group.version,
    createdAt: group.createdAt,
    updatedAt: group.updatedAt,
  };
}

export function toGroupSummaryItem(
  group: Pick<GroupDocument, 'groupId' | 'name'>,
): GroupSummaryItem {
  return {
    groupId: group.groupId,
    name: group.name,
  };
}

export function toGroupStudentOption(
  user: Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'uo'>,
): GroupStudentOption {
  return toStudentOption(user);
}
