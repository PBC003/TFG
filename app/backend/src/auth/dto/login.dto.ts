import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^(uo\d{6}|uo\d{6}@uniovi\.es)$/i, {
    message: 'Login must use a valid UniOvi email or UO identifier',
  })
  email!: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 72)
  password!: string;
}
