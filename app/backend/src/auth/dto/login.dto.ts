import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  @Matches(/^uo\d{6}@uniovi\.es$/i, {
    message: 'Email must be a valid UniOvi institutional email',
  })
  email!: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 72)
  password!: string;
}
