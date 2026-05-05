import { GroupMemberImportService } from '../../../../src/groups/services/group-member-import.service';

describe('GroupMemberImportService', () => {
  it('returns matches and missing identifiers', async () => {
    const repository = {
      find: jestLikeAsync([
        {
          id: 1,
          firstName: 'Ada',
          lastName: 'Lovelace',
          email: 'uo000001@uniovi.es',
          uo: 'UO000001',
        },
      ]),
    };
    const service = new GroupMemberImportService(repository as never);

    await expect(
      service.importGroupMembers('uo000001@uniovi.es\nUO000999'),
    ).resolves.toEqual({
      matchedStudents: [
        {
          id: 1,
          fullName: 'Ada Lovelace',
          email: 'uo000001@uniovi.es',
          uo: 'UO000001',
        },
      ],
      missingIdentifiers: ['UO000999'],
      importedCount: 2,
      matchedCount: 1,
    });
  });

  it('throws when no identifiers are found', async () => {
    const service = new GroupMemberImportService({
      find: jestLikeAsync([]),
    } as never);

    await expect(service.importGroupMembers('  ')).rejects.toBeDefined();
  });
});

function jestLikeAsync<T>(value: T) {
  return async () => value;
}
