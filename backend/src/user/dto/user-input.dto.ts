import { IsString, IsEmail, IsEnum, IsOptional, MinLength } from 'class-validator';
import { IUser } from '../user.inteface';

export class UserInputDto implements Partial<IUser> {
    @IsString()
    @MinLength(2, { message: 'Full name must be at least 2 characters long' })
    fullName!: string;

    @IsEmail({}, { message: 'Invalid email address' })
    email!: string;

    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password!: string;

    @IsEnum(['b2b', 'b2c'], { message: 'Type must be either "b2b" or "b2c"' })
    type!: IUser['type'];

    @IsOptional()
    @IsString()
    companyId?: string;
}