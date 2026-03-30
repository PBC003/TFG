import { HttpException, HttpStatus } from '@nestjs/common';
import { createAppErrorBody } from '../../common/errors/app-http.exception';
import {
  extractUoFromEmail,
  isValidInstitutionalEmail,
  normalizeInstitutionalEmail,
} from '../../common/utils/email.util';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';

type EnsureEmailAvailabilityInput = {
  currentUserId: number;
  normalizedEmail: string;
  uo: string;
};

type EnsureEmailAvailability = (
  input: EnsureEmailAvailabilityInput,
) => Promise<boolean>;

export async function applyUpdateUserDtoToUser(
  user: User,
  updateUserDto: UpdateUserDto,
  ensureEmailAvailability: EnsureEmailAvailability,
): Promise<boolean> {
  let hasChanges = false;

  if (updateUserDto.firstName !== undefined) {
    user.firstName = normalizeFirstName(updateUserDto.firstName);
    hasChanges = true;
  }

  if (updateUserDto.lastName !== undefined) {
    user.lastName = normalizeLastName(updateUserDto.lastName);
    hasChanges = true;
  }

  if (updateUserDto.email !== undefined) {
    const normalizedEmail = normalizeValidatedInstitutionalEmail(
      updateUserDto.email,
    );
    const uo = extractUoFromEmail(normalizedEmail);
    const hasConflict = await ensureEmailAvailability({
      currentUserId: user.id,
      normalizedEmail,
      uo,
    });

    if (hasConflict) {
      throwUserEmailAlreadyExists();
    }

    user.email = normalizedEmail;
    user.uo = uo;
    hasChanges = true;
  }

  return hasChanges;
}

export function assertUserUpdateHasChanges(hasChanges: boolean): void {
  if (hasChanges) {
    return;
  }

  throw new HttpException(
    createAppErrorBody(
      'user.update_requires_field',
      'At least one field must be provided',
    ),
    HttpStatus.BAD_REQUEST,
  );
}

function normalizeFirstName(firstName: string): string {
  const normalizedFirstName = firstName.trim();

  if (normalizedFirstName.length < 2 || normalizedFirstName.length > 30) {
    throw new HttpException(
      createAppErrorBody(
        'user.invalid_first_name_length',
        'firstName must be between 2 and 30 characters',
      ),
      HttpStatus.BAD_REQUEST,
    );
  }

  return normalizedFirstName;
}

function normalizeLastName(lastName: string): string {
  const normalizedLastName = lastName.trim();

  if (normalizedLastName.length < 2 || normalizedLastName.length > 50) {
    throw new HttpException(
      createAppErrorBody(
        'user.invalid_last_name_length',
        'lastName must be between 2 and 50 characters',
      ),
      HttpStatus.BAD_REQUEST,
    );
  }

  return normalizedLastName;
}

function normalizeValidatedInstitutionalEmail(email: string): string {
  const normalizedEmail = normalizeInstitutionalEmail(email);

  if (!isValidInstitutionalEmail(normalizedEmail)) {
    throw new HttpException(
      createAppErrorBody(
        'auth.invalid_institutional_email',
        'Invalid UniOvi institutional email',
      ),
      HttpStatus.BAD_REQUEST,
    );
  }

  return normalizedEmail;
}

function throwUserEmailAlreadyExists(): never {
  throw new HttpException(
    createAppErrorBody(
      'user.email_already_exists',
      'A user with that email already exists',
    ),
    HttpStatus.CONFLICT,
  );
}
