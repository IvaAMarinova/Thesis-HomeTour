import { Exclude } from 'class-transformer';
import { IUser } from './../user.inteface';

export class UserResponseDto {
  id: string;
  fullName: string;
  email: string;
  type: IUser['type'];
  companyId?: string;

  @Exclude()
  password: string;

  constructor(user: Partial<IUser>) {
    this.id = user.id;
    this.fullName = user.fullName;
    this.email = user.email;
    this.type = user.type;
    this.companyId = user.company?.id;
    this.password = user.password;
  }
}
