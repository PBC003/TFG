import { GroupsController } from '../../../src/groups/groups.controller';
import { loadModuleWithoutReflect } from '../helpers/load-without-reflect';

describe('GroupsController', () => {
  const groupsService = {
    listGroups: jest.fn(),
    listStudentOptions: jest.fn(),
    createGroup: jest.fn(),
    updateGroup: jest.fn(),
    archiveGroup: jest.fn(),
    importGroupMembers: jest.fn(),
  };

  const controller = new GroupsController(groupsService as never);
  const request = { user: { id: 7, role: 'TEACHER' } } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('wraps service responses and delegates all group endpoints', async () => {
    groupsService.listGroups.mockResolvedValue([{ groupId: 'group-1' }]);
    groupsService.listStudentOptions.mockResolvedValue([{ id: 1 }]);
    groupsService.createGroup.mockResolvedValue({ groupId: 'group-1' });
    groupsService.updateGroup.mockResolvedValue({ groupId: 'group-1' });
    groupsService.archiveGroup.mockResolvedValue(undefined);
    groupsService.importGroupMembers.mockResolvedValue({
      matchedStudents: [{ id: 1 }],
      missingIdentifiers: [],
      importedCount: 1,
      matchedCount: 1,
    });

    await expect(controller.listGroups(request)).resolves.toEqual({
      groups: [{ groupId: 'group-1' }],
    });
    await expect(controller.listStudentOptions()).resolves.toEqual({
      students: [{ id: 1 }],
    });
    await expect(
      controller.createGroup({ name: 'Group' } as never, request),
    ).resolves.toEqual({ group: { groupId: 'group-1' } });
    await expect(
      controller.updateGroup('group-1', { name: 'Updated' } as never, request),
    ).resolves.toEqual({ group: { groupId: 'group-1' } });
    await expect(
      controller.archiveGroup('group-1', request),
    ).resolves.toBeUndefined();
    await expect(
      controller.importGroupMembers({ rawText: 'uo000001@uniovi.es' } as never),
    ).resolves.toEqual({
      result: {
        matchedStudents: [{ id: 1 }],
        missingIdentifiers: [],
        importedCount: 1,
        matchedCount: 1,
      },
    });

    expect(groupsService.listGroups).toHaveBeenCalledWith(request.user);
    expect(groupsService.createGroup).toHaveBeenCalledWith(
      { name: 'Group' },
      request.user,
    );
    expect(groupsService.updateGroup).toHaveBeenCalledWith(
      'group-1',
      { name: 'Updated' },
      request.user,
    );
    expect(groupsService.archiveGroup).toHaveBeenCalledWith(
      'group-1',
      request.user,
    );
    expect(groupsService.importGroupMembers).toHaveBeenCalledWith(
      'uo000001@uniovi.es',
    );
  });

  it('loads the module without Reflect decorator helpers', () => {
    const { GroupsController: ReloadedController } = loadModuleWithoutReflect<
      typeof import('../../../src/groups/groups.controller')
    >('../../../src/groups/groups.controller', __filename);

    expect(new ReloadedController({} as never)).toBeInstanceOf(
      ReloadedController,
    );
  });
});
