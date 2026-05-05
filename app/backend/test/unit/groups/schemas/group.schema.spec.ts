import {
  Group,
  GroupSchema,
} from '../../../../src/groups/schemas/group.schema';
import { loadModuleWithoutReflect } from '../../helpers/load-without-reflect';

describe('Group schema', () => {
  it('defines defaults and indexes', () => {
    const group = new Group();

    expect(group).toBeInstanceOf(Group);
    expect(GroupSchema.path('groupId').options.default()).toEqual(
      expect.any(String),
    );
    expect(GroupSchema.path('version').options.default).toBe(1);
    expect(GroupSchema.path('isArchived').options.default).toBe(false);
    expect(GroupSchema.indexes()).toEqual(
      expect.arrayContaining([
        [
          expect.objectContaining({
            createdByUserId: 1,
            isArchived: 1,
            updatedAt: -1,
          }),
          expect.any(Object),
        ],
        [
          expect.objectContaining({ isArchived: 1, name: 1 }),
          expect.any(Object),
        ],
        [
          expect.objectContaining({ memberUserIds: 1, isArchived: 1 }),
          expect.any(Object),
        ],
      ]),
    );
  });

  it('loads the module without Reflect decorator helpers', () => {
    const { Group: ReloadedGroup, GroupSchema: ReloadedGroupSchema } =
      loadModuleWithoutReflect<
        typeof import('../../../../src/groups/schemas/group.schema')
      >('../../../../src/groups/schemas/group.schema', __filename);

    expect(new ReloadedGroup()).toBeInstanceOf(ReloadedGroup);
    expect(ReloadedGroupSchema.path('name')).toBeDefined();
  });
});
