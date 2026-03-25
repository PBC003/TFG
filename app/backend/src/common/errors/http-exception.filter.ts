import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';

interface ErrorPayload {
  code: string;
  details?: Record<string, unknown>;
  message: string;
}

function mapStatusToCode(statusCode: number): string {
  switch (statusCode) {
    case 400:
      return 'common.bad_request';
    case 401:
      return 'common.unauthorized';
    case 403:
      return 'common.forbidden';
    case 404:
      return 'common.not_found';
    case 409:
      return 'common.conflict';
    default:
      return 'common.internal_error';
  }
}

function normalizeMessage(candidate: unknown, statusCode: number): string {
  if (typeof candidate === 'string' && candidate.trim()) {
    return candidate;
  }

  if (Array.isArray(candidate) && typeof candidate[0] === 'string') {
    return candidate[0];
  }

  if (statusCode === 500) {
    return 'Unexpected internal server error';
  }

  return 'Request failed';
}

function normalizeHttpException(exception: HttpException): {
  statusCode: number;
  payload: ErrorPayload;
} {
  const statusCode = exception.getStatus();
  const response = exception.getResponse();

  if (typeof response === 'string') {
    return {
      statusCode,
      payload: {
        code: mapStatusToCode(statusCode),
        message: normalizeMessage(response, statusCode),
      },
    };
  }

  if (response && typeof response === 'object') {
    const candidate = response as {
      code?: string;
      details?: Record<string, unknown>;
      message?: string | string[];
    };

    return {
      statusCode,
      payload: {
        code: candidate.code ?? mapStatusToCode(statusCode),
        details: candidate.details,
        message: normalizeMessage(candidate.message, statusCode),
      },
    };
  }

  return {
    statusCode,
    payload: {
      code: mapStatusToCode(statusCode),
      message: normalizeMessage(undefined, statusCode),
    },
  };
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    if (exception instanceof HttpException) {
      const normalized = normalizeHttpException(exception);

      response.status(normalized.statusCode).json({
        statusCode: normalized.statusCode,
        code: normalized.payload.code,
        message: normalized.payload.message,
        details: normalized.payload.details,
        path: request.url,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'common.internal_error',
      message: 'Unexpected internal server error',
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
