import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 72)
  currentPassword!: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 72)
  newPassword!: string;
}
