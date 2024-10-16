import { Entity, PrimaryKey, Property, BeforeCreate, ManyToOne, Enum } from '@mikro-orm/core';
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

  @Property({ unique: true })
  email!: string;

  @Property()
  password!: string;

  @Enum(() => UserType)
  type!: UserType;

  @ManyToOne(() => Company, { nullable: true })
  company?: Company;

  @BeforeCreate()
  setId() {
    this.id = uuidv4();
  }
}