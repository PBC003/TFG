const uniOviEmailPattern = /^uo\d{6}@uniovi\.es$/i;
const uniOviLoginPattern = /^(uo\d{6}|uo\d{6}@uniovi\.es)$/i;

export function normalizeUniOviLoginIdentifier(value: string): string {
  const trimmed = value.trim().toLowerCase();

  if (/^uo\d{6}$/i.test(trimmed)) {
    return `${trimmed}@uniovi.es`;
  }

  return trimmed;
}

export function validateFirstName(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return "forms.validation.required";
  }

  if (trimmed.length < 2 || trimmed.length > 30) {
    return "forms.validation.firstNameLength";
  }

  return null;
}

export function validateLastName(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return "forms.validation.required";
  }

  if (trimmed.length < 2 || trimmed.length > 50) {
    return "forms.validation.lastNameLength";
  }

  return null;
}

export function validateUniOviEmail(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return "forms.validation.required";
  }

  if (!uniOviEmailPattern.test(trimmed)) {
    return "forms.validation.unioviEmail";
  }

  return null;
}

export function validateUniOviLoginIdentifier(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return "forms.validation.required";
  }

  if (!uniOviLoginPattern.test(trimmed)) {
    return "forms.validation.unioviLogin";
  }

  return null;
}

export function validatePassword(value: string): string | null {
  if (!value.trim()) {
    return "forms.validation.required";
  }

  if (value.length < 8 || value.length > 72) {
    return "forms.validation.passwordLength";
  }

  return null;
}
