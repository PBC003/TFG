import { extractGroupMemberIdentifiers } from '../../../../src/groups/utils/group-import.util';

describe('group-import.util', () => {
  it('extracts unique institutional emails and uo identifiers from csv-like text', () => {
    expect(
      extractGroupMemberIdentifiers(
        'name,email\nAda,uo000002@uniovi.es\nAlan,UO000003\nAda,uo000002@uniovi.es',
      ),
    ).toEqual({
      emails: ['uo000002@uniovi.es'],
      uos: ['UO000003'],
      identifiers: ['uo000002@uniovi.es', 'UO000003'],
    });
  });

  it('returns empty collections for blank text', () => {
    expect(extractGroupMemberIdentifiers('   ')).toEqual({
      emails: [],
      uos: [],
      identifiers: [],
    });
  });
});
