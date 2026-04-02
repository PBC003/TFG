import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Not, QueryFailedError, Repository } from 'typeorm';
import { createAppErrorBody } from '../common/errors/app-http.exception';
import { AuthSession } from '../auth/entities/auth-session.entity';
import { hashSecret } from '../auth/utils/password.util';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Role } from './enums/role.enum';
import { AdminUserItem } from './types/admin-user-item.type';
import { toAdminUserItem } from './utils/admin-user-item.util';
import {
  applyUpdateUserDtoToUser,
  assertUserUpdateHasChanges,
} from './utils/update-user.util';
import { revokeActiveSessionsForUser } from './utils/user-session.util';
export type { AdminUserItem } from './types/admin-user-item.type';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(AuthSession)
    private readonly authSessionsRepository: Repository<AuthSession>,
  ) {}

  async listUsers(): Promise<AdminUserItem[]> {
    const users = await this.usersRepository.find({
      order: { id: 'ASC' },
    });

    return users.map(toAdminUserItem);
  }

  async findUserById(id: number): Promise<AdminUserItem> {
    const user = await this.findExistingUserOrThrow(id);
    return toAdminUserItem(user);
  }

  async updateUser(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<AdminUserItem> {
    const user = await this.findExistingUserOrThrow(id);
    const hasChanges = await applyUpdateUserDtoToUser(
      user,
      updateUserDto,
      async ({ currentUserId, normalizedEmail, uo }) => {
        const conflictingUser = await this.usersRepository.findOne({
          where: [
            { email: normalizedEmail, id: Not(currentUserId) },
            { uo, id: Not(currentUserId) },
          ],
          withDeleted: true,
        });

        return Boolean(conflictingUser);
      },
    );

    assertUserUpdateHasChanges(hasChanges);

    try {
      const savedUser = await this.usersRepository.save(user);
      return toAdminUserItem(savedUser);
    } catch (error) {
      this.throwMappedUpdateError(error);
    }
  }

  async updateUserRole(id: number, role: Role): Promise<AdminUserItem> {
    const user = await this.findExistingUserOrThrow(id);
    user.role = role;

    const savedUser = await this.usersRepository.save(user);
    return toAdminUserItem(savedUser);
  }

  async updateUserStatus(
    id: number,
    isActive: boolean,
  ): Promise<AdminUserItem> {
    const user = await this.findExistingUserOrThrow(id);
    user.isActive = isActive;

    const savedUser = await this.usersRepository.save(user);
    return toAdminUserItem(savedUser);
  }

  async updateUserPassword(id: number, newPassword: string): Promise<void> {
    const user = await this.findExistingUserOrThrow(id);

    if (newPassword.length < 8) {
      throw new HttpException(
        createAppErrorBody(
          'user.password_too_short',
          'Password must be at least 8 characters long',
        ),
        HttpStatus.BAD_REQUEST,
      );
    }

    user.passwordHash = await hashSecret(newPassword);
    await this.usersRepository.save(user);

    await revokeActiveSessionsForUser(this.authSessionsRepository, user.id);
  }

  async deleteUser(id: number): Promise<void> {
    await this.usersRepository.manager.transaction(
      async (manager: EntityManager) => {
        const usersRepository = manager.getRepository(User);
        const authSessionsRepository = manager.getRepository(AuthSession);
        const user = await usersRepository.findOne({
          where: { id },
        });

        if (!user) {
          this.throwUserNotFound();
        }

        user.isActive = false;
        await usersRepository.save(user);

        await revokeActiveSessionsForUser(authSessionsRepository, user.id);
        await usersRepository.softDelete(user.id);
      },
    );
  }

  private async findExistingUserOrThrow(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      this.throwUserNotFound();
    }

    return user;
  }

  private throwMappedUpdateError(error: unknown): never {
    if (
      error instanceof QueryFailedError &&
      (error as QueryFailedError & { driverError?: { code?: string } })
        .driverError?.code === 'ER_DUP_ENTRY'
    ) {
      throw new HttpException(
        createAppErrorBody(
          'user.email_already_exists',
          'A user with that email already exists',
        ),
        HttpStatus.CONFLICT,
      );
    }

    throw new HttpException(
      createAppErrorBody('user.update_failed', 'Failed to update user'),
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  private throwUserNotFound(): never {
    throw new HttpException(
      createAppErrorBody('user.not_found', 'User not found'),
      HttpStatus.NOT_FOUND,
    );
  }
}
