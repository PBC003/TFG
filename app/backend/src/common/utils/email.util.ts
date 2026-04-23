const UO_IDENTIFIER_REGEX = /^uo(\d{6})$/i;
const UO_EMAIL_REGEX = /^uo(\d{6})@uniovi\.es$/i;

export function normalizeInstitutionalEmail(email: string): string {
  const normalizedValue = email.trim().toLowerCase();

  if (UO_IDENTIFIER_REGEX.test(normalizedValue)) {
    return `${normalizedValue}@uniovi.es`;
  }

  return normalizedValue;
}

export function isValidInstitutionalEmail(email: string): boolean {
  return UO_EMAIL_REGEX.test(normalizeInstitutionalEmail(email));
}

export function extractUoFromEmail(email: string): string {
  const normalizedEmail = normalizeInstitutionalEmail(email);
  const match = normalizedEmail.match(UO_EMAIL_REGEX);

  if (!match) {
    throw new Error('Invalid UniOvi institutional email format');
  }

  return `UO${match[1]}`;
}
