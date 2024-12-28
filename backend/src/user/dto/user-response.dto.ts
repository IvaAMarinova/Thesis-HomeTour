import { Exclude } from 'class-transformer';
import { User, UserRole } from '../user.entity';

export class UserResponseDto {
  id: string;
  fullName: string;
  email: string;
  type: User['type'];
  company?: string;
  roles: UserRole[];

  @Exclude()
  password: string;

  constructor(user: Partial<User>) {
    this.id = user.id;
    this.fullName = user.fullName;
    this.email = user.email;
    this.type = user.type;
    this.company = user.company?.id;
    this.roles = user.roles;
  }
}
