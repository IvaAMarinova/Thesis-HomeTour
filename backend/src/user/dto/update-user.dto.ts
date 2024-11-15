import { IsString, IsEmail, IsEnum, IsOptional } from 'class-validator';
import { UserType } from '../user.entity';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    fullName?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    password?: string;

    @IsOptional()
    @IsEnum(UserType)
    type?: UserType;

    @IsOptional()
    @IsString()
    companyId?: string;
}
