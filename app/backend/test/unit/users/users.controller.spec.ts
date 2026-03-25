import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '../../../src/users/enums/role.enum';
import { UsersController } from '../../../src/users/users.controller';
import { UsersService } from '../../../src/users/users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

  const adminUser = {
    id: 1,
    firstName: 'Pablo',
    lastName: 'Carrasco',
    email: 'uo123456@uniovi.es',
    uo: 'UO123456',
    role: Role.ADMIN,
    isActive: true,
    lastLoginAt: null,
    createdAt: new Date('2026-03-24T10:00:00.000Z'),
    updatedAt: new Date('2026-03-24T10:00:00.000Z'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            listUsers: jest.fn(),
            findUserById: jest.fn(),
            updateUser: jest.fn(),
            updateUserRole: jest.fn(),
            updateUserStatus: jest.fn(),
            updateUserPassword: jest.fn(),
            deleteUser: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(UsersController);
    usersService = module.get(UsersService);
  });

  it('wraps service responses using the controller response contracts', async () => {
    usersService.listUsers.mockResolvedValue([adminUser]);
    usersService.findUserById.mockResolvedValue(adminUser);
    usersService.updateUser.mockResolvedValue(adminUser);
    usersService.updateUserRole.mockResolvedValue(adminUser);
    usersService.updateUserStatus.mockResolvedValue(adminUser);

    await expect(controller.findAll()).resolves.toEqual({ users: [adminUser] });
    await expect(controller.findOne(1)).resolves.toEqual({ user: adminUser });
    await expect(
      controller.updateUser(1, { firstName: 'New name' }),
    ).resolves.toEqual({ user: adminUser });
    await expect(
      controller.updateRole(1, { role: Role.TEACHER }),
    ).resolves.toEqual({ user: adminUser });
    await expect(
      controller.updateStatus(1, { isActive: false }),
    ).resolves.toEqual({ user: adminUser });
  });

  it('delegates password updates and deletions without returning a body', async () => {
    await expect(
      controller.updatePassword(1, { newPassword: 'password123' }),
    ).resolves.toBeUndefined();
    await expect(controller.deleteUser(1)).resolves.toBeUndefined();

    expect(usersService.updateUserPassword).toHaveBeenCalledWith(
      1,
      'password123',
    );
    expect(usersService.deleteUser).toHaveBeenCalledWith(1);
  });
});
