import { IsString, IsEmail, IsEnum, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  fullName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  @IsEnum(['b2b', 'b2c'])
  type!: string;

  @IsOptional()
  @IsString()
  companyId?: string;
}
