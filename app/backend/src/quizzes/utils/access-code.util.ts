const ACCESS_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function normalizeAccessCode(value?: string | null): string {
  return (value ?? '').trim().toUpperCase();
}

export function generateAccessCode(length = 6): string {
  let result = '';

  for (let index = 0; index < length; index += 1) {
    const randomIndex = Math.floor(Math.random() * ACCESS_CODE_ALPHABET.length);
    result += ACCESS_CODE_ALPHABET[randomIndex];
  }

  return result;
}
