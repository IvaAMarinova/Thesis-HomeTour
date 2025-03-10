import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  Enum,
  BeforeCreate,
  BeforeUpdate,
  Index,
  OneToMany,
  Cascade,
} from '@mikro-orm/core';
import { Company } from '../company/company.entity';
import { v4 } from 'uuid';
import { UserProperty } from '../user-property/user-property.entity';
import { Tokens } from '../auth/tokens.entity';

export enum UserType {
  B2B = 'b2b',
  B2C = 'b2c',
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
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

  @Property({ default: false })
  isGoogleUser!: boolean;

  @Property()
  password?: string;

  @Enum(() => UserType)
  type!: UserType;

  @ManyToOne(() => Company, { nullable: true })
  @Index()
  company?: Company;

  @Enum({ items: () => UserRole, array: true, default: [UserRole.USER] })
  roles!: UserRole[];

  @OneToMany(() => UserProperty, (userProperty) => userProperty.user, {
    orphanRemoval: true,
    cascade: [Cascade.REMOVE],
  })
  userProperties!: UserProperty[];

  @OneToMany(() => Tokens, (Tokens) => Tokens.user, {
    orphanRemoval: true,
    cascade: [Cascade.REMOVE],
  })
  tokens!: Tokens[];

  @BeforeCreate()
  @BeforeUpdate()
  validate() {
    if (typeof this.fullName !== 'string' || this.fullName.length < 2) {
      throw new Error('Full name must be at least 2 characters long');
    }

    if (!/^\S+@\S+\.\S+$/.test(this.email)) {
      throw new Error('Invalid email address');
    }

    if (
      !this.isGoogleUser &&
      (typeof this.password !== 'string' || this.password.length < 6)
    ) {
      throw new Error(
        'Password must be at least 6 characters long if not a Google user',
      );
    }

    if (!Object.values(UserType).includes(this.type)) {
      throw new Error('Type must be either "b2b" or "b2c"');
    }

    if (this.company && typeof this.company !== 'object') {
      throw new Error('Invalid company reference');
    }
  }
}
