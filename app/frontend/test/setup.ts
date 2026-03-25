import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

export const mockI18n = {
  resolvedLanguage: 'es',
  changeLanguage: vi.fn(async () => undefined),
  on: vi.fn(),
  use: vi.fn().mockReturnThis(),
  init: vi.fn(async () => undefined),
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { defaultValue?: string }) =>
      options && 'defaultValue' in options
        ? (options.defaultValue ?? key)
        : key,
    i18n: mockI18n,
  }),
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn(),
  },
}));

beforeEach(() => {
  mockI18n.resolvedLanguage = 'es';
  mockI18n.changeLanguage.mockClear();
  mockI18n.on.mockClear();
  mockI18n.use.mockClear();
  mockI18n.use.mockReturnThis();
  mockI18n.init.mockClear();
  vi.restoreAllMocks();
});

afterEach(() => {
  cleanup();
});
