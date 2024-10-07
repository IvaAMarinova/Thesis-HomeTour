import { Entity, PrimaryKey, Property, ManyToOne, Enum, OneToMany, OneToOne } from '@mikro-orm/core';
import { Company } from './company.entity';
import { v4 as uuidv4 } from 'uuid';

@Entity()
export class User {

  @PrimaryKey()
  id: string = uuidv4();

  @Property()
  fullName!: string;

  @Property()
  email!: string;

  @Property()
  type!: UserType;

  @OneToOne(() => Company)
  company: Company;
}

export enum UserType {
  B2B = 'b2b',
  B2C = 'b2c'
}
