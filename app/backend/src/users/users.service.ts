import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Not, QueryFailedError, Repository } from 'typeorm';
import { createAppErrorBody } from '../common/errors/app-http.exception';
import {
  extractUoFromEmail,
  isValidInstitutionalEmail,
  normalizeInstitutionalEmail,
} from '../common/utils/email.util';
import { AuthSession } from '../auth/entities/auth-session.entity';
import { hashSecret } from '../auth/utils/password.util';
import { User } from './entities/user.entity';
import { Role } from './enums/role.enum';
import { UpdateUserDto } from './dto/update-user.dto';

export type AdminUserItem = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  uo: string;
  role: Role;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

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

    return users.map((user) => this.toAdminUserItem(user));
  }

  async findUserById(id: number): Promise<AdminUserItem> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new HttpException(
        createAppErrorBody('user.not_found', 'User not found'),
        HttpStatus.NOT_FOUND,
      );
    }

    return this.toAdminUserItem(user);
  }

  async updateUser(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<AdminUserItem> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new HttpException(
        createAppErrorBody('user.not_found', 'User not found'),
        HttpStatus.NOT_FOUND,
      );
    }

    let hasChanges = false;

    if (updateUserDto.firstName !== undefined) {
      const firstName = updateUserDto.firstName.trim();

      if (firstName.length < 2 || firstName.length > 30) {
        throw new HttpException(
          createAppErrorBody(
            'user.invalid_first_name_length',
            'firstName must be between 2 and 30 characters',
          ),
          HttpStatus.BAD_REQUEST,
        );
      }

      user.firstName = firstName;
      hasChanges = true;
    }

    if (updateUserDto.lastName !== undefined) {
      const lastName = updateUserDto.lastName.trim();

      if (lastName.length < 2 || lastName.length > 50) {
        throw new HttpException(
          createAppErrorBody(
            'user.invalid_last_name_length',
            'lastName must be between 2 and 50 characters',
          ),
          HttpStatus.BAD_REQUEST,
        );
      }

      user.lastName = lastName;
      hasChanges = true;
    }

    if (updateUserDto.email !== undefined) {
      const normalizedEmail = normalizeInstitutionalEmail(updateUserDto.email);

      if (!isValidInstitutionalEmail(normalizedEmail)) {
        throw new HttpException(
          createAppErrorBody(
            'auth.invalid_institutional_email',
            'Invalid UniOvi institutional email',
          ),
          HttpStatus.BAD_REQUEST,
        );
      }

      const uo = extractUoFromEmail(normalizedEmail);

      const conflictingUser = await this.usersRepository.findOne({
        where: [
          { email: normalizedEmail, id: Not(id) },
          { uo, id: Not(id) },
        ],
        withDeleted: true,
      });

      if (conflictingUser) {
        throw new HttpException(
          createAppErrorBody(
            'user.email_already_exists',
            'A user with that email already exists',
          ),
          HttpStatus.CONFLICT,
        );
      }

      user.email = normalizedEmail;
      user.uo = uo;
      hasChanges = true;
    }

    if (!hasChanges) {
      throw new HttpException(
        createAppErrorBody(
          'user.update_requires_field',
          'At least one field must be provided',
        ),
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const savedUser = await this.usersRepository.save(user);
      return this.toAdminUserItem(savedUser);
    } catch (error) {
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
  }

  async updateUserRole(id: number, role: Role): Promise<AdminUserItem> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new HttpException(
        createAppErrorBody('user.not_found', 'User not found'),
        HttpStatus.NOT_FOUND,
      );
    }

    user.role = role;

    const savedUser = await this.usersRepository.save(user);
    return this.toAdminUserItem(savedUser);
  }

  async updateUserStatus(
    id: number,
    isActive: boolean,
  ): Promise<AdminUserItem> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new HttpException(
        createAppErrorBody('user.not_found', 'User not found'),
        HttpStatus.NOT_FOUND,
      );
    }

    user.isActive = isActive;

    const savedUser = await this.usersRepository.save(user);
    return this.toAdminUserItem(savedUser);
  }

  async updateUserPassword(id: number, newPassword: string): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new HttpException(
        createAppErrorBody('user.not_found', 'User not found'),
        HttpStatus.NOT_FOUND,
      );
    }

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

    await this.revokeActiveSessionsForUser(
      this.authSessionsRepository,
      user.id,
    );
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
          throw new HttpException(
            createAppErrorBody('user.not_found', 'User not found'),
            HttpStatus.NOT_FOUND,
          );
        }

        user.isActive = false;
        await usersRepository.save(user);

        await this.revokeActiveSessionsForUser(authSessionsRepository, user.id);

        await usersRepository.softDelete(user.id);
      },
    );
  }

  private async revokeActiveSessionsForUser(
    authSessionsRepository: Repository<AuthSession>,
    userId: number,
  ): Promise<void> {
    const activeSessions = await authSessionsRepository
      .createQueryBuilder('session')
      .leftJoin('session.user', 'user')
      .where('user.id = :userId', { userId })
      .andWhere('session.revokedAt IS NULL')
      .getMany();

    if (activeSessions.length === 0) {
      return;
    }

    const revokedAt = new Date();

    for (const session of activeSessions) {
      session.revokedAt = revokedAt;
    }

    await authSessionsRepository.save(activeSessions);
  }

  private toAdminUserItem(user: User): AdminUserItem {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      uo: user.uo,
      role: user.role,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
