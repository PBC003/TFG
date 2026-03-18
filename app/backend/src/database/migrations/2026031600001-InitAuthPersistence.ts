import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';
import { Role } from '../../users/enums/role.enum';

export class InitAuthPersistence2026031600001 implements MigrationInterface {
  name = 'InitAuthPersistence2026031600001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'int',
            unsigned: true,
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'first_name',
            type: 'varchar',
            length: '30',
          },
          {
            name: 'last_name',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'uo',
            type: 'varchar',
            length: '8',
            isUnique: true,
          },
          {
            name: 'password_hash',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'role',
            type: 'enum',
            enum: [Role.ADMIN, Role.TEACHER, Role.STUDENT],
            default: `'${Role.STUDENT}'`,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'last_login_at',
            type: 'datetime',
            precision: 6,
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'datetime',
            precision: 6,
            default: 'CURRENT_TIMESTAMP(6)',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            precision: 6,
            default: 'CURRENT_TIMESTAMP(6)',
            onUpdate: 'CURRENT_TIMESTAMP(6)',
          },
          {
            name: 'deleted_at',
            type: 'datetime',
            precision: 6,
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_USERS_ROLE',
        columnNames: ['role'],
      }),
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_USERS_DELETED_AT',
        columnNames: ['deleted_at'],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'auth_sessions',
        columns: [
          {
            name: 'id',
            type: 'int',
            unsigned: true,
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'user_id',
            type: 'int',
            unsigned: true,
          },
          {
            name: 'refresh_token_hash',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'expires_at',
            type: 'datetime',
            precision: 6,
          },
          {
            name: 'revoked_at',
            type: 'datetime',
            precision: 6,
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'datetime',
            precision: 6,
            default: 'CURRENT_TIMESTAMP(6)',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            precision: 6,
            default: 'CURRENT_TIMESTAMP(6)',
            onUpdate: 'CURRENT_TIMESTAMP(6)',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'auth_sessions',
      new TableIndex({
        name: 'IDX_AUTH_SESSIONS_USER_ID',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'auth_sessions',
      new TableIndex({
        name: 'IDX_AUTH_SESSIONS_EXPIRES_AT',
        columnNames: ['expires_at'],
      }),
    );

    await queryRunner.createForeignKey(
      'auth_sessions',
      new TableForeignKey({
        name: 'FK_AUTH_SESSIONS_USER_ID',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'auth_sessions',
      'FK_AUTH_SESSIONS_USER_ID',
    );
    await queryRunner.dropIndex(
      'auth_sessions',
      'IDX_AUTH_SESSIONS_EXPIRES_AT',
    );
    await queryRunner.dropIndex('auth_sessions', 'IDX_AUTH_SESSIONS_USER_ID');
    await queryRunner.dropTable('auth_sessions');
    await queryRunner.dropIndex('users', 'IDX_USERS_DELETED_AT');
    await queryRunner.dropIndex('users', 'IDX_USERS_ROLE');
    await queryRunner.dropTable('users');
  }
}
