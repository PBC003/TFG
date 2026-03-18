import * as bcrypt from 'bcrypt';

const HASH_ROUNDS = 12;

export function hashSecret(value: string): Promise<string> {
  return bcrypt.hash(value, HASH_ROUNDS);
}

export function compareSecret(
  value: string,
  hashedValue: string,
): Promise<boolean> {
  return bcrypt.compare(value, hashedValue);
}
