import { IsEnum } from 'class-validator';
import { Role } from '../enums/role.enum';

export class UpdateUserRoleDto {
  @IsEnum(Role)
  role!: Role;
}
