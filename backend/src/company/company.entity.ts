import { Entity, PrimaryKey, Property, BeforeCreate, JsonType } from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';

@Entity()
export class Company {

  @PrimaryKey()
  id: string;

  @Property()
  name!: string;

  @Property({ columnType: 'text' })
  description!: string;

  @Property()
  email!: string;

  @Property()
  phoneNumber!: string;

  @Property()
  website!: string;

  @Property({ type: JsonType, nullable: true })
  resources?: {
    logo?: string | null;
    galleryImages?: string[];
  };

  @BeforeCreate()
  setId() {
    this.id = uuidv4();
  }
}
