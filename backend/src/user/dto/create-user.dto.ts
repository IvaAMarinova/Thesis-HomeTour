import { IsString, IsEmail, IsEnum, IsOptional } from 'class-validator';
import { IUser } from './../user.inteface';

export class CreateUserDto implements Partial<IUser> {
    @IsString()
    fullName!: string;

    @IsEmail()
    email!: string;

    @IsString()
    password!: string;

    @IsEnum(['b2b', 'b2c'])
    type!: IUser['type'];

    @IsOptional()
    @IsString()
    companyId?: string;
}
