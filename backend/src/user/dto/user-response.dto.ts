import { Exclude } from 'class-transformer';
import { UserType } from '../user.entity';

export class UserResponseDto {
    id: string;
    fullName: string;
    email: string;
    type: UserType;
    companyId?: string;

    @Exclude()
    password: string;

    constructor(user: Partial<UserResponseDto>) {
        this.id = user.id;
        this.fullName = user.fullName;
        this.email = user.email;
        this.type = user.type;
        this.companyId = user.companyId;
        this.password = user.password;
    }
}
