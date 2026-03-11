import { IsString, IsNotEmpty, Validate } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.toUpperCase())
  name!: string;
}
