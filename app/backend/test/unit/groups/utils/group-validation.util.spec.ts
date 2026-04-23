import { normalizeGroupMutationPayload } from '../../../../src/groups/utils/group-validation.util';

describe('group-validation.util', () => {
  it('normalizes a valid mutation payload', () => {
    expect(
      normalizeGroupMutationPayload(
        {
          name: '  Group A  ',
          description: '  Demo  ',
          memberUserIds: [3, 3, 4],
        },
        undefined,
        () => {
          throw new Error('should not throw');
        },
      ),
    ).toEqual({
      name: 'Group A',
      description: 'Demo',
      memberUserIds: [3, 4],
    });
  });

  it('falls back to current values when fields are omitted', () => {
    expect(
      normalizeGroupMutationPayload(
        {},
        {
          name: 'Existing',
          description: 'Desc',
          memberUserIds: [1, 2],
        },
        () => {
          throw new Error('should not throw');
        },
      ),
    ).toEqual({
      name: 'Existing',
      description: 'Desc',
      memberUserIds: [1, 2],
    });
  });

  it('throws when the group name is missing', () => {
    expect(() =>
      normalizeGroupMutationPayload(
        { name: ' ' },
        undefined,
        (_code, message) => {
          throw new Error(message);
        },
      ),
    ).toThrow('A group name is required');
  });
});
