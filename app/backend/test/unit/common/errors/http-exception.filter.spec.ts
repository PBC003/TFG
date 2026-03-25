import {
  ArgumentsHost,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpExceptionFilter } from '../../../../src/common/errors/http-exception.filter';

describe('HttpExceptionFilter', () => {
  const filter = new HttpExceptionFilter();

  function createHost() {
    const status = jest.fn().mockReturnThis();
    const json = jest.fn();
    const response = { status, json };
    const request = { url: '/auth/login' };

    const host = {
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => request,
      }),
    } as ArgumentsHost;

    return { host, response };
  }

  it('normalizes HttpException objects with structured payloads', () => {
    const { host, response } = createHost();
    const exception = new HttpException(
      {
        code: 'auth.missing_refresh_token',
        message: 'Missing refresh token',
        details: { source: 'cookie' },
      },
      HttpStatus.UNAUTHORIZED,
    );

    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.UNAUTHORIZED,
        code: 'auth.missing_refresh_token',
        message: 'Missing refresh token',
        details: { source: 'cookie' },
        path: '/auth/login',
      }),
    );
  });

  it('maps plain string HttpException payloads to common codes', () => {
    const { host, response } = createHost();
    const exception = new BadRequestException('Body is invalid');

    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        code: 'common.bad_request',
        message: 'Body is invalid',
      }),
    );
  });

  it('returns a generic internal error for unknown exceptions', () => {
    const { host, response } = createHost();

    filter.catch(new Error('boom'), host);

    expect(response.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: 'common.internal_error',
        message: 'Unexpected internal server error',
      }),
    );
  });
});
