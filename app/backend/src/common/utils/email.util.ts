const UO_EMAIL_REGEX = /^uo(\d{6})@uniovi\.es$/i;

export function normalizeInstitutionalEmail(email: string): string {
  return email.trim().toLowerCase();
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
