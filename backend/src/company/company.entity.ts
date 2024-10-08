import { Entity, PrimaryKey, Property, BeforeCreate } from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';

@Entity()
export class Company {

  @PrimaryKey()
  id: string;

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

  @BeforeCreate()
  setId() {
    this.id = uuidv4();
  }
}
