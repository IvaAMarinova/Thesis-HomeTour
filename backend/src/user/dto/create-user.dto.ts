import { IsString, IsEmail, IsEnum, IsOptional } from 'class-validator';
import { UserType } from '../user.entity';

export class CreateUserDto {
    @IsString()
    fullName: string;

    @IsEmail()
    email: string;

    @IsString()
    password: string;

    @IsEnum(UserType)
    type: UserType;

    @IsOptional()
    @IsString()
    companyId?: string;
}
