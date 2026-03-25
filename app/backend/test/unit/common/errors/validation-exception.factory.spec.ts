import {
  HttpException,
  HttpStatus,
  type ValidationError,
} from '@nestjs/common';
import { createValidationException } from '../../../../src/common/errors/validation-exception.factory';

describe('createValidationException', () => {
  it('builds a normalized validation error payload, including nested fields', () => {
    const nestedChild: ValidationError = {
      property: 'email',
      constraints: {
        matches: 'Email must be a valid UniOvi institutional email',
      },
      children: [],
    };

    const root: ValidationError = {
      property: 'registerDto',
      children: [nestedChild],
    };

    const firstName: ValidationError = {
      property: 'firstName',
      constraints: {
        isLength: 'firstName must be between 2 and 30 characters',
      },
      children: [],
    };

    const exception = createValidationException([root, firstName]);

    expect(exception).toBeInstanceOf(HttpException);
    expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    expect(exception.getResponse()).toEqual({
      code: 'common.validation_error',
      message: 'Email must be a valid UniOvi institutional email',
      details: {
        fields: [
          {
            field: 'email',
            messages: ['Email must be a valid UniOvi institutional email'],
          },
          {
            field: 'firstName',
            messages: ['firstName must be between 2 and 30 characters'],
          },
        ],
      },
    });
  });

  it('falls back to a generic validation message when there are no details', () => {
    const exception = createValidationException([]);

    expect(exception.getResponse()).toEqual({
      code: 'common.validation_error',
      message: 'Validation failed',
      details: {
        fields: [],
      },
    });
  });
});
