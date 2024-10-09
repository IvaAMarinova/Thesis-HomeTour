import { Entity, PrimaryKey, Property, BeforeCreate, OneToOne, Enum } from '@mikro-orm/core';
import { Company } from '../company/company.entity';
import { v4 as uuidv4 } from 'uuid';

export enum UserType {
  B2B = 'b2b',
  B2C = 'b2c'
}

@Entity()
export class User {

  @PrimaryKey()
  id: string;

  @Property()
  fullName!: string;

  @Property()
  email!: string;

  @Property()
  password!: string;

  @Enum(() => UserType)
  type!: UserType;

  @OneToOne(() => Company, { nullable: true })
  company?: Company;

  @BeforeCreate()
  setId() {
    this.id = uuidv4();
  }
}

