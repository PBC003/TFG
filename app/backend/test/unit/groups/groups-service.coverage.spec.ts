import { HttpStatus } from '@nestjs/common';
import { Role } from '../../../src/users/enums/role.enum';
import { GroupsService } from '../../../src/groups/groups.service';
import { GroupMemberImportService } from '../../../src/groups/services/group-member-import.service';

type FindChain<T> = {
  sort: jest.Mock;
  exec: jest.Mock<Promise<T>, []>;
};

type VisibilityFindOneChain<T> = {
  exec: jest.Mock<Promise<T>, []>;
};

type NameLookupChain<T> = {
  collation: jest.Mock;
  where: jest.Mock;
  equals: jest.Mock;
  exec: jest.Mock<Promise<T>, []>;
};

describe('GroupsService', () => {
  const createFindChain = <T>(value: T): FindChain<T> => ({
    sort: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(value),
  });

  const createVisibilityFindOneChain = <T>(
    value: T,
  ): VisibilityFindOneChain<T> => ({
    exec: jest.fn().mockResolvedValue(value),
  });

  const createNameLookupChain = <T>(value: T): NameLookupChain<T> => ({
    collation: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    equals: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(value),
  });

  const createGroupModelMock = () => ({
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  });

  const createUserRepositoryMock = () => ({
    find: jest.fn(),
  });

  const createService = () => {
    const groupModel = createGroupModelMock();
    const userRepository = createUserRepositoryMock();
    const groupMemberImportService = new GroupMemberImportService(
      userRepository as never,
    );
    const service = new GroupsService(
      groupModel as never,
      userRepository as never,
      groupMemberImportService as never,
    );

    return { service, groupModel, userRepository };
  };

  const teacherUser = { id: 7, role: Role.TEACHER };
  const adminUser = { id: 1, role: Role.ADMIN };

  const createGroupDocument = (overrides: Record<string, unknown> = {}) => ({
    groupId: 'group-1',
    name: 'Group One',
    description: 'Description',
    memberUserIds: [2, 3],
    createdByUserId: 7,
    updatedByUserId: 7,
    version: 1,
    isArchived: false,
    archivedAt: null,
    archivedByUserId: null,
    createdAt: new Date('2026-04-17T10:00:00.000Z'),
    updatedAt: new Date('2026-04-17T12:00:00.000Z'),
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  });

  const studentRows = [
    {
      id: 2,
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@uniovi.es',
      uo: 'UO000002',
    },
    {
      id: 3,
      firstName: 'Alan',
      lastName: 'Turing',
      email: 'alan@uniovi.es',
      uo: 'UO000003',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a group with normalized values and returns the mapped members', async () => {
    const { service, groupModel, userRepository } = createService();
    const groupDocument = createGroupDocument({
      name: 'Math team',
      description: 'Advanced calculus',
      memberUserIds: [2, 3],
    });

    groupModel.findOne.mockReturnValueOnce(createNameLookupChain(null));
    userRepository.find
      .mockResolvedValueOnce([{ id: 2 }, { id: 3 }])
      .mockResolvedValueOnce(studentRows);
    groupModel.create.mockResolvedValue(groupDocument);

    const result = await service.createGroup(
      {
        name: '  Math team  ',
        description: '  Advanced calculus  ',
        memberUserIds: [2, 2, 3],
      },
      teacherUser,
    );

    expect(groupModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Math team',
        description: 'Advanced calculus',
        memberUserIds: [2, 3],
        createdByUserId: 7,
        updatedByUserId: 7,
      }),
    );
    expect(userRepository.find).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: expect.objectContaining({ role: Role.STUDENT, isActive: true }),
        select: { id: true },
      }),
    );
    expect(userRepository.find).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          uo: true,
        },
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({
        groupId: 'group-1',
        name: 'Math team',
        description: 'Advanced calculus',
        memberUserIds: [2, 3],
        memberCount: 2,
        members: [
          {
            id: 2,
            fullName: 'Ada Lovelace',
            email: 'ada@uniovi.es',
            uo: 'UO000002',
          },
          {
            id: 3,
            fullName: 'Alan Turing',
            email: 'alan@uniovi.es',
            uo: 'UO000003',
          },
        ],
      }),
    );
  });

  it('lists visible groups with teacher and admin visibility filters', async () => {
    const { service, groupModel, userRepository } = createService();
    const teacherGroups = [
      createGroupDocument(),
      createGroupDocument({ groupId: 'group-2', memberUserIds: [] }),
    ];
    const adminGroups = [
      createGroupDocument({ createdByUserId: 99, updatedByUserId: 99 }),
    ];

    groupModel.find.mockReturnValueOnce(createFindChain(teacherGroups));
    userRepository.find.mockResolvedValueOnce(studentRows);

    const teacherResult = await service.listGroups(teacherUser);

    expect(groupModel.find).toHaveBeenNthCalledWith(1, {
      isArchived: { $ne: true },
      createdByUserId: 7,
    });
    expect(teacherResult).toHaveLength(2);
    expect(teacherResult[0]?.memberCount).toBe(2);
    expect(teacherResult[1]?.memberCount).toBe(0);

    groupModel.find.mockReturnValueOnce(createFindChain(adminGroups));
    userRepository.find.mockResolvedValueOnce(studentRows);

    await service.listGroups(adminUser);

    expect(groupModel.find).toHaveBeenNthCalledWith(2, {
      isArchived: { $ne: true },
    });
  });

  it('lists active student options ordered by name', async () => {
    const { service, userRepository } = createService();
    userRepository.find.mockResolvedValueOnce(studentRows);

    await expect(service.listStudentOptions()).resolves.toEqual([
      {
        id: 2,
        fullName: 'Ada Lovelace',
        email: 'ada@uniovi.es',
        uo: 'UO000002',
      },
      {
        id: 3,
        fullName: 'Alan Turing',
        email: 'alan@uniovi.es',
        uo: 'UO000003',
      },
    ]);

    expect(userRepository.find).toHaveBeenCalledWith({
      where: { role: Role.STUDENT, isActive: true },
      order: { lastName: 'ASC', firstName: 'ASC' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        uo: true,
      },
    });
  });

  it('imports student identifiers from csv-like raw text', async () => {
    const { service, userRepository } = createService();
    userRepository.find.mockResolvedValueOnce(studentRows);

    await expect(
      service.importGroupMembers('UO000002\nUO000003'),
    ).resolves.toEqual({
      matchedStudents: [
        {
          id: 2,
          fullName: 'Ada Lovelace',
          email: 'ada@uniovi.es',
          uo: 'UO000002',
        },
        {
          id: 3,
          fullName: 'Alan Turing',
          email: 'alan@uniovi.es',
          uo: 'UO000003',
        },
      ],
      missingIdentifiers: [],
      importedCount: 2,
      matchedCount: 2,
    });

    expect(userRepository.find).toHaveBeenCalledWith({
      where: [
        {
          role: Role.STUDENT,
          isActive: true,
          uo: expect.objectContaining({
            _type: 'in',
            _value: ['UO000002', 'UO000003'],
          }),
        },
      ],
      order: { lastName: 'ASC', firstName: 'ASC' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        uo: true,
      },
    });
  });

  it('rejects imports that do not contain institutional identifiers and reports missing rows', async () => {
    const { service, userRepository } = createService();

    await expect(
      service.importGroupMembers('Name,Mail\nAda,not-an-email'),
    ).rejects.toMatchObject({
      response: expect.objectContaining({
        code: 'group.import_requires_identifiers',
      }),
      status: HttpStatus.BAD_REQUEST,
    });

    userRepository.find.mockResolvedValueOnce(studentRows.slice(0, 1));
    await expect(
      service.importGroupMembers('UO000002\nUO000003\nUO000099'),
    ).resolves.toEqual(
      expect.objectContaining({
        matchedCount: 1,
        importedCount: 3,
        missingIdentifiers: ['UO000003', 'UO000099'],
      }),
    );
  });

  it('updates a group using the current values when optional fields are omitted', async () => {
    const { service, groupModel, userRepository } = createService();
    const groupDocument = createGroupDocument({
      name: 'Original name',
      description: 'Original description',
      memberUserIds: [2, 3],
      version: 4,
    });

    groupModel.findOne
      .mockReturnValueOnce(createVisibilityFindOneChain(groupDocument))
      .mockReturnValueOnce(createNameLookupChain(null));
    userRepository.find
      .mockResolvedValueOnce([{ id: 2 }, { id: 3 }])
      .mockResolvedValueOnce(studentRows);

    const result = await service.updateGroup(
      'group-1',
      {
        name: '  Updated name  ',
      },
      teacherUser,
    );

    expect(groupDocument.name).toBe('Updated name');
    expect(groupDocument.description).toBe('Original description');
    expect(groupDocument.memberUserIds).toEqual([2, 3]);
    expect(groupDocument.updatedByUserId).toBe(7);
    expect(groupDocument.version).toBe(5);
    expect(groupDocument.save).toHaveBeenCalled();
    expect(result.name).toBe('Updated name');
  });

  it('rejects updates without any fields', async () => {
    const { service, groupModel } = createService();
    groupModel.findOne.mockReturnValueOnce(
      createVisibilityFindOneChain(createGroupDocument()),
    );

    await expect(
      service.updateGroup('group-1', {}, teacherUser),
    ).rejects.toMatchObject({
      response: expect.objectContaining({
        code: 'common.bad_request',
        message: 'At least one group field must be provided',
      }),
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('archives a visible group and updates audit fields', async () => {
    const { service, groupModel } = createService();
    const groupDocument = createGroupDocument({ version: 2 });
    groupModel.findOne.mockReturnValueOnce(
      createVisibilityFindOneChain(groupDocument),
    );

    await service.archiveGroup('group-1', teacherUser);

    expect(groupDocument.isArchived).toBe(true);
    expect(groupDocument.archivedAt).toBeInstanceOf(Date);
    expect(groupDocument.archivedByUserId).toBe(7);
    expect(groupDocument.updatedByUserId).toBe(7);
    expect(groupDocument.version).toBe(3);
    expect(groupDocument.save).toHaveBeenCalled();
  });

  it('throws not found when the group is not visible for the current user', async () => {
    const { service, groupModel } = createService();
    groupModel.findOne.mockReturnValueOnce(createVisibilityFindOneChain(null));

    await expect(
      service.findVisibleGroupDocumentOrThrow('missing-group', teacherUser),
    ).rejects.toMatchObject({
      response: expect.objectContaining({
        code: 'common.not_found',
        message: 'Group not found',
      }),
      status: HttpStatus.NOT_FOUND,
    });
  });

  it('rejects missing names, invalid lengths, duplicate names and invalid members', async () => {
    const { service, groupModel, userRepository } = createService();

    await expect(
      service.createGroup(
        { name: '   ', description: null, memberUserIds: [] },
        teacherUser,
      ),
    ).rejects.toMatchObject({
      response: expect.objectContaining({
        message: 'A group name is required',
      }),
      status: HttpStatus.BAD_REQUEST,
    });

    await expect(
      service.createGroup(
        { name: 'ab', description: null, memberUserIds: [] },
        teacherUser,
      ),
    ).rejects.toMatchObject({
      response: expect.objectContaining({
        message: 'The group name must contain between 3 and 120 characters',
      }),
      status: HttpStatus.BAD_REQUEST,
    });

    groupModel.findOne.mockReturnValueOnce(
      createNameLookupChain(createGroupDocument({ groupId: 'existing-group' })),
    );

    await expect(
      service.createGroup(
        { name: 'Existing', description: null, memberUserIds: [] },
        teacherUser,
      ),
    ).rejects.toMatchObject({
      response: expect.objectContaining({
        code: 'group.name_already_exists',
        message: 'A group with that name already exists',
      }),
      status: HttpStatus.CONFLICT,
    });

    groupModel.findOne.mockReturnValueOnce(createNameLookupChain(null));
    userRepository.find.mockResolvedValueOnce([{ id: 2 }]);

    await expect(
      service.createGroup(
        { name: 'Valid group', description: null, memberUserIds: [2, 3] },
        teacherUser,
      ),
    ).rejects.toMatchObject({
      response: expect.objectContaining({
        message:
          'At least one selected group member is not a valid active student',
      }),
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('uses a find operator when validating and loading member ids', async () => {
    const { service, groupModel, userRepository } = createService();
    const groupDocument = createGroupDocument({ memberUserIds: [2] });
    groupModel.findOne.mockReturnValueOnce(createNameLookupChain(null));
    userRepository.find
      .mockResolvedValueOnce([{ id: 2 }])
      .mockResolvedValueOnce(studentRows.slice(0, 1));
    groupModel.create.mockResolvedValue(groupDocument);

    await service.createGroup(
      { name: 'Operator group', description: null, memberUserIds: [2] },
      teacherUser,
    );

    const firstWhere = userRepository.find.mock.calls[0][0].where;
    const secondWhere = userRepository.find.mock.calls[1][0].where;

    expect(firstWhere.id).toEqual(
      expect.objectContaining({ _type: 'in', _value: [2] }),
    );
    expect(secondWhere.id).toEqual(
      expect.objectContaining({ _type: 'in', _value: [2] }),
    );
  });
});
