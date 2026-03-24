import {
  HttpException,
  HttpStatus,
  type ValidationError,
} from '@nestjs/common';
import type { AppErrorBody } from './app-http.exception';
import type { AppErrorCode } from './app-error-code.type';

function buildErrorBody(
  code: AppErrorCode,
  message: string,
  details?: Record<string, unknown>,
): AppErrorBody {
  if (details === undefined) {
    return { code, message };
  }

  return { code, message, details };
}

function flattenValidationErrors(errors: ValidationError[]): Array<{
  field: string;
  messages: string[];
}> {
  return errors.flatMap((error) => {
    const ownMessages = Object.values(error.constraints ?? {});
    const children = error.children?.length
      ? flattenValidationErrors(error.children)
      : [];

    if (ownMessages.length === 0) {
      return children;
    }

    return [
      {
        field: error.property,
        messages: ownMessages,
      },
      ...children,
    ];
  });
}

export function createValidationException(
  errors: ValidationError[],
): HttpException {
  const details = flattenValidationErrors(errors);
  const firstMessage = details[0]?.messages[0] ?? 'Validation failed';

  return new HttpException(
    buildErrorBody('common.validation_error', firstMessage, {
      fields: details,
    }),
    HttpStatus.BAD_REQUEST,
  );
}
