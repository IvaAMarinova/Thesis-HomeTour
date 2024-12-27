import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  Enum,
  BeforeCreate,
  BeforeUpdate,
  Index,
} from '@mikro-orm/core';
import { Company } from '../company/company.entity';
import { v4 } from 'uuid';

export enum UserType {
  B2B = 'b2b',
  B2C = 'b2c',
}

@Entity()
export class User {
  @PrimaryKey({
    columnType: 'uuid',
    type: 'uuid',
  })
  id = v4();

  @Property()
  fullName!: string;

  @Property({ unique: true })
  email!: string;

  @Property()
  password!: string;

  @Enum(() => UserType)
  type!: UserType;

  @ManyToOne(() => Company, { nullable: true })
  @Index()
  company?: Company;

  @BeforeCreate()
  @BeforeUpdate()
  validate() {
    if (typeof this.fullName !== 'string' || this.fullName.length < 2) {
      throw new Error('Full name must be at least 2 characters long');
    }

    if (!/^\S+@\S+\.\S+$/.test(this.email)) {
      throw new Error('Invalid email address');
    }

    if (typeof this.password !== 'string' || this.password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    if (!Object.values(UserType).includes(this.type)) {
      throw new Error('Type must be either "b2b" or "b2c"');
    }

    if (this.company && typeof this.company !== 'object') {
      throw new Error('Invalid company reference');
    }
  }
}
