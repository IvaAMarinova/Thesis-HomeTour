import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';

@Entity()
export class Company {

  @PrimaryKey()
  id: string = uuidv4();

  @Property()
  name!: string;

  @Property()
  description!: string;

  @Property()
  email!: string;

  @Property()
  phone_number!: string;

  @Property()
  website!: string;
}
