import { IsString, IsEmail, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username!: string;

  @IsEmail()
  @MaxLength(100)
  email!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(255)
  password!: string;
}
