import {
  toGroupItem,
  toGroupStudentOption,
  toGroupSummaryItem,
} from '../../../../src/groups/utils/group-item.util';

describe('group-item.util', () => {
  it('maps groups, summaries and student options', () => {
    const studentsById = new Map([
      [
        1,
        {
          id: 1,
          firstName: 'Ada',
          lastName: 'Lovelace',
          email: 'ada@example.com',
          uo: 'UO1',
        },
      ],
      [
        2,
        {
          id: 2,
          firstName: 'Alan',
          lastName: 'Turing',
          email: 'alan@example.com',
          uo: 'UO2',
        },
      ],
    ]);

    const group = {
      groupId: 'group-1',
      name: 'Group',
      description: 'Desc',
      memberUserIds: [1, 2, 3],
      createdByUserId: 7,
      updatedByUserId: 7,
      version: 2,
      createdAt: new Date('2026-04-12T10:00:00.000Z'),
      updatedAt: new Date('2026-04-12T11:00:00.000Z'),
    } as never;

    expect(toGroupStudentOption(studentsById.get(1)!)).toEqual({
      id: 1,
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      uo: 'UO1',
    });
    expect(toGroupSummaryItem(group)).toEqual({
      groupId: 'group-1',
      name: 'Group',
    });
    expect(toGroupItem(group, studentsById)).toEqual(
      expect.objectContaining({
        groupId: 'group-1',
        memberUserIds: [1, 2, 3],
        memberCount: 2,
        members: [
          {
            id: 1,
            fullName: 'Ada Lovelace',
            email: 'ada@example.com',
            uo: 'UO1',
          },
          {
            id: 2,
            fullName: 'Alan Turing',
            email: 'alan@example.com',
            uo: 'UO2',
          },
        ],
      }),
    );
  });
});
