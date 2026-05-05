import {
  extractUoFromEmail,
  isValidInstitutionalEmail,
  normalizeInstitutionalEmail,
} from '../../../../src/common/utils/email.util';

describe('email.util', () => {
  it('normalizes institutional emails and UO identifiers', () => {
    expect(normalizeInstitutionalEmail('  UO123456@UniOvi.es  ')).toBe(
      'uo123456@uniovi.es',
    );
    expect(normalizeInstitutionalEmail('  UO123456  ')).toBe(
      'uo123456@uniovi.es',
    );
  });

  it.each([
    ['uo123456@uniovi.es', true],
    ['UO654321@UNIOVI.ES', true],
    ['uo654321', true],
    ['test@example.com', false],
    ['uo12345@uniovi.es', false],
  ] as const)('validates %s', (email, expected) => {
    expect(isValidInstitutionalEmail(email)).toBe(expected);
  });

  it('extracts the UO identifier from an institutional email', () => {
    expect(extractUoFromEmail('UO123456@uniovi.es')).toBe('UO123456');
    expect(extractUoFromEmail('uo123456')).toBe('UO123456');
  });

  it('throws when extracting the UO identifier from an invalid email', () => {
    expect(() => extractUoFromEmail('invalid@example.com')).toThrow(
      'Invalid UniOvi institutional email format',
    );
  });
});
