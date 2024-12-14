import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UserPropertyInputDto {
    @IsString({ message: 'User id must be a string' })
    userId!: string;

    @IsString({ message: 'Property id must be a string' })
    propertyId!: string;

    @IsOptional()
    @IsBoolean({ message: 'Liked must be a boolean' })
    liked?: boolean;
}