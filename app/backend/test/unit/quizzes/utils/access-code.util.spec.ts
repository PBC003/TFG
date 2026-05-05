import {
  generateAccessCode,
  normalizeAccessCode,
} from '../../../../src/quizzes/utils/access-code.util';

describe('access-code.util', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('normalizes access codes', () => {
    expect(normalizeAccessCode(' ab-1 ')).toBe('AB1');
    expect(normalizeAccessCode(null)).toBe('');
  });

  it('generates deterministic access codes when randomness is mocked', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0);
    expect(generateAccessCode(4)).toBe('AAAA');
  });
});
