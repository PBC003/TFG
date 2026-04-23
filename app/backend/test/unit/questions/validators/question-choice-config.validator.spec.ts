import {
  isValidMultipleChoiceConfig,
  isValidSingleChoiceConfig,
} from '../../../../src/questions/validators/question-choice-config.validator';

describe('question-choice-config.validator', () => {
  it('accepts valid single-choice and multiple-choice configs', () => {
    expect(
      isValidSingleChoiceConfig({
        options: [
          { key: 'a', text: 'Option A' },
          { key: 'b', text: 'Option B' },
        ],
        correctOptionKey: 'a',
      }),
    ).toBe(true);

    expect(
      isValidMultipleChoiceConfig({
        options: [
          { key: 'a', text: 'Option A' },
          { key: 'b', text: 'Option B' },
          { key: 'c', text: 'Option C' },
        ],
        correctOptionKeys: ['a', 'c'],
      }),
    ).toBe(true);
  });

  it('rejects malformed options arrays and invalid correct answers', () => {
    expect(
      isValidSingleChoiceConfig({
        options: [{ key: 'a', text: 'Only one option' }],
        correctOptionKey: 'a',
      }),
    ).toBe(false);

    expect(
      isValidSingleChoiceConfig({
        options: [
          { key: 'a', text: 'Option A' },
          { key: 'a', text: 'Duplicated key' },
        ],
        correctOptionKey: 'a',
      }),
    ).toBe(false);

    expect(
      isValidSingleChoiceConfig({
        options: [
          { key: 'a', text: 'Option A' },
          { key: 'b', text: '   ' },
        ],
        correctOptionKey: 'a',
      }),
    ).toBe(false);

    expect(
      isValidSingleChoiceConfig({
        options: [
          { key: 'a', text: 'Option A' },
          { key: 'b', text: 'Option B' },
        ],
        correctOptionKey: 'z',
      }),
    ).toBe(false);

    expect(
      isValidMultipleChoiceConfig({
        options: [
          { key: 'a', text: 'Option A' },
          { key: 'b', text: 'Option B' },
        ],
        correctOptionKeys: [],
      }),
    ).toBe(false);

    expect(
      isValidMultipleChoiceConfig({
        options: [
          { key: 'a', text: 'Option A' },
          { key: 'b', text: 'Option B' },
        ],
        correctOptionKeys: ['a', 'a'],
      }),
    ).toBe(false);

    expect(
      isValidMultipleChoiceConfig({
        options: [
          { key: 'a', text: 'Option A' },
          { key: 'b', text: 'Option B' },
        ],
        correctOptionKeys: ['a', 'z'],
      }),
    ).toBe(false);
  });
});
