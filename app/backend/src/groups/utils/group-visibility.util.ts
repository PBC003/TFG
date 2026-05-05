import { Role } from '../../users/enums/role.enum';
import type { AuthorizedGroupUser } from '../groups.service';

export function buildGroupVisibilityFilter(
  user: AuthorizedGroupUser,
): Record<string, unknown> {
  if (user.role === Role.ADMIN) {
    return { isArchived: { $ne: true } };
  }

  return {
    isArchived: { $ne: true },
    createdByUserId: user.id,
  };
}
