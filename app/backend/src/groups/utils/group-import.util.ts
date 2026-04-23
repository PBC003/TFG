const EMAIL_REGEX = /\buo\d{6}@uniovi\.es\b/gi;
const UO_REGEX = /\buo\d{6}\b/gi;

export type ExtractedGroupIdentifiers = {
  emails: string[];
  uos: string[];
  identifiers: string[];
};

export function extractGroupMemberIdentifiers(
  rawText: string,
): ExtractedGroupIdentifiers {
  const normalizedSource = rawText.trim().toLowerCase();

  if (!normalizedSource) {
    return { emails: [], uos: [], identifiers: [] };
  }

  const emails = new Map<string, string>();
  const uos = new Map<string, string>();

  for (const match of normalizedSource.matchAll(EMAIL_REGEX)) {
    const normalized = match[0].trim().toLowerCase();

    if (!emails.has(normalized)) {
      emails.set(normalized, normalized);
    }
  }

  for (const match of normalizedSource.matchAll(UO_REGEX)) {
    const normalized = match[0].trim().toUpperCase();

    if (
      !emails.has(`${normalized.toLowerCase()}@uniovi.es`) &&
      !uos.has(normalized)
    ) {
      uos.set(normalized, normalized);
    }
  }

  return {
    emails: Array.from(emails.values()),
    uos: Array.from(uos.values()),
    identifiers: [...emails.values(), ...uos.values()],
  };
}
