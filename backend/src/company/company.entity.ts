import { Entity, PrimaryKey, Property, BeforeCreate, JsonType } from '@mikro-orm/core';
import { v4 } from 'uuid';

@Entity()
export class Company {
  @PrimaryKey({
    columnType: 'uuid',
    type: 'uuid',
  })
  id = v4();

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
    logoImage?: string | null;
    galleryImages?: string[];
  };
}
