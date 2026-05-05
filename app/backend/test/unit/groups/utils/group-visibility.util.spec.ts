import { Role } from '../../../../src/users/enums/role.enum';
import { buildGroupVisibilityFilter } from '../../../../src/groups/utils/group-visibility.util';

describe('group-visibility.util', () => {
  it('returns a global filter for admins', () => {
    expect(buildGroupVisibilityFilter({ id: 1, role: Role.ADMIN })).toEqual({
      isArchived: { $ne: true },
    });
  });

  it('returns an owner-scoped filter for teachers', () => {
    expect(buildGroupVisibilityFilter({ id: 7, role: Role.TEACHER })).toEqual({
      isArchived: { $ne: true },
      createdByUserId: 7,
    });
  });
});
