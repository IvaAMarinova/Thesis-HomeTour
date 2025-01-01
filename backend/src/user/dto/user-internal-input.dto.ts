import { IsString, IsEmail, IsEnum, IsOptional, MinLength, IsBoolean, IsArray, ArrayMinSize } from 'class-validator';
import { User, UserRole } from '../user.entity';

export class UserInternalInputDto {
    @IsString()
    @MinLength(2, { message: 'Full name must be at least 2 characters long' })
    fullName!: string;

    @IsEmail({}, { message: 'Invalid email address' })
    email!: string;

    @IsOptional()
    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password?: string;

    @IsBoolean()
    isGoogleUser!: boolean;

    @IsEnum(['b2b', 'b2c'], { message: 'Type must be either "b2b" or "b2c"' })
    type!: User['type'];

    @IsOptional()
    @IsString()
    company?: string;

    @IsArray({ message: 'Roles must be an array' })
    @ArrayMinSize(1, { message: 'At least one role must be specified' })
    @IsEnum(UserRole, { each: true, message: 'Invalid role specified' })
    roles!: UserRole[];
}