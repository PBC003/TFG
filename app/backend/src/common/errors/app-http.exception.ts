import type { AppErrorCode } from './app-error-code.type';

export interface AppErrorBody {
  code: AppErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

export function createAppErrorBody(
  code: AppErrorCode,
  message: string,
  details?: Record<string, unknown>,
): AppErrorBody {
  if (details === undefined) {
    return { code, message };
  }

  return {
    code,
    message,
    details,
  };
}
