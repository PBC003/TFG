import * as bcrypt from 'bcrypt';
import {
  compareSecret,
  hashSecret,
} from '../../../../src/auth/utils/password.util';

describe('password.util', () => {
  it('hashes secrets using twelve rounds', async () => {
    const hashedValue = await hashSecret('plain-secret');

    expect(hashedValue).toBeDefined();
    expect(hashedValue).not.toBe('plain-secret');
    expect(bcrypt.getRounds(hashedValue)).toBe(12);
    await expect(bcrypt.compare('plain-secret', hashedValue)).resolves.toBe(
      true,
    );
  });

  it('compares secrets against the hashed value', async () => {
    const hashedValue = await bcrypt.hash('plain-secret', 12);

    await expect(compareSecret('plain-secret', hashedValue)).resolves.toBe(
      true,
    );
    await expect(compareSecret('wrong-secret', hashedValue)).resolves.toBe(
      false,
    );
  });
});
