import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UserPropertyInputDto {
  @IsString({ message: 'User id must be a string' })
  user!: string;

  @IsString({ message: 'Property id must be a string' })
  property!: string;

  @IsOptional()
  @IsBoolean({ message: 'Liked must be a boolean' })
  liked?: boolean;
}
