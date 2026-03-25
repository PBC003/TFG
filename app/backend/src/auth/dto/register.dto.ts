import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 30)
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  lastName!: string;

  @IsEmail()
  @IsNotEmpty()
  @Matches(/^uo\d{6}@uniovi\.es$/i, {
    message: 'Email must be a valid UniOvi institutional email',
  })
  email!: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 72)
  password!: string;
}
