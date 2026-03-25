import type { AuthContextValue } from '../../src/context/AuthContext';
import type { PublicUser } from '../../src/types/auth';

export const mockUser: PublicUser = {
  id: 1,
  firstName: 'Pablo',
  lastName: 'Carrasco',
  email: 'uo289642@uniovi.es',
  uo: 'UO289642',
  role: 'ADMIN',
  isActive: true,
  createdAt: '2026-03-01T10:00:00.000Z',
  updatedAt: '2026-03-10T10:00:00.000Z',
};

export function createAuthValue(
  overrides: Partial<AuthContextValue> = {},
): AuthContextValue {
  return {
    accessToken: 'token',
    isAuthenticated: true,
    isAdmin: true,
    status: 'authenticated',
    user: mockUser,
    login: async () => undefined,
    register: async () => undefined,
    logout: async () => undefined,
    restoreSession: async () => 'token',
    changePassword: async () => undefined,
    executeWithSession: async <T>(operation: (accessToken: string) => Promise<T>) =>
      operation('token'),
    ...overrides,
  };
}
