import {
  Entity,
  PrimaryKey,
  Property,
  BeforeCreate,
  BeforeUpdate,
  JsonType,
} from '@mikro-orm/core';
import { v4 } from 'uuid';

@Entity()
export class Company {
  @PrimaryKey({
    columnType: 'uuid',
    type: 'uuid',
  })
  id = v4();

  @Property({ length: 100 })
  name!: string;

  @Property({ columnType: 'text' })
  description!: string;

  @Property()
  email!: string;

  @Property({ length: 15 })
  phoneNumber!: string;

  @Property()
  website!: string;

  @Property({ type: JsonType })
  resources!: {
    logoImage: string;
    galleryImage: string;
  };

  @BeforeCreate()
  @BeforeUpdate()
  validate() {
    if (!/^\S+@\S+\.\S+$/.test(this.email)) {
      throw new Error('Invalid email format');
    }

    if (!/^\+?\d[\d\s]{8,15}$/.test(this.phoneNumber)) {
      throw new Error('Invalid phone number format');
    }

    if (!/^https?:\/\/[\w.-]+\.[a-z]{2,6}(\/.*)?$/.test(this.website)) {
      throw new Error('Invalid website URL');
    }

    if (this.description.length < 64) {
      throw new Error('Description must be at least 64 characters long');
    }

    if (this.description.length > 2048) {
      throw new Error('Description must be at most 2048 characters long');
    }

    if (
      typeof this.resources.logoImage !== 'string' ||
      typeof this.resources.galleryImage !== 'string'
    ) {
      throw new Error(
        'Invalid resources format. Both logoImage and galleryImage must be strings.',
      );
    }
  }
}
