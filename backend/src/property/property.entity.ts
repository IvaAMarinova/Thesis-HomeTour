import {
  Entity,
  PrimaryKey,
  Property,
  JsonType,
  Cascade,
  ManyToOne,
  OneToMany,
  BeforeCreate,
  BeforeUpdate,
  Index,
} from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Company } from '../company/company.entity';
import { UserProperty } from '../user-property/user-property.entity';

@Entity()
export class PropertyEntity {
  @PrimaryKey({
    columnType: 'uuid',
    type: 'uuid',
  })
  id = v4();

  @Property({ length: 100 })
  name!: string;

  @Property({ columnType: 'text' })
  description!: string;

  @Property({ nullable: true })
  floor!: number;

  @Property({ type: JsonType })
  address!: {
    street: string;
    city: string;
    neighborhood: string;
  };

  @Property()
  phoneNumber!: string;

  @Property()
  email!: string;

  @Property({ type: JsonType })
  resources!: {
    headerImage: string | null;
    galleryImages: string[];
    visualizationFolder?: string | null;
  };

  @ManyToOne(() => Company)
  @Index()
  company!: Company;

  @OneToMany(() => UserProperty, (userProperty) => userProperty.property, {
    orphanRemoval: true,
    cascade: [Cascade.REMOVE],
  })
  userProperties!: UserProperty[];

  @BeforeCreate()
  @BeforeUpdate()
  validate() {
    if (this.description.length < 64 || this.description.length > 2048) {
      throw new Error('Description must be between 64 and 2048 characters');
    }

    if (this.floor !== null && (!Number.isInteger(this.floor) || this.floor <= 0)) {
      throw new Error('Floor must be a positive integer');
    }

    if (!/^\+?\d[\d\s]{8,15}$/.test(this.phoneNumber)) {
      throw new Error('Invalid phone number');
    }

    if (!/^\S+@\S+\.\S+$/.test(this.email)) {
      throw new Error('Invalid email address');
    }

    if (
      typeof this.address.street !== 'string' ||
      typeof this.address.city !== 'string' ||
      typeof this.address.neighborhood !== 'string'
    ) {
      throw new Error('Invalid address. Street, city, and neighborhood must be strings');
    }

    if (
      typeof this.resources.headerImage !== 'string' &&
      this.resources.headerImage !== null
    ) {
      throw new Error('Header image must be a string or null');
    }

    if (!Array.isArray(this.resources.galleryImages)) {
      throw new Error('Gallery images must be an array');
    }

    if (this.resources.galleryImages.length > 10) {
      throw new Error('Gallery images can have a maximum of 10 images');
    }

    if (!this.resources.galleryImages.every((img) => typeof img === 'string')) {
      throw new Error('Each gallery image must be a string');
    }

    if (
      typeof this.resources.visualizationFolder !== 'string' &&
      this.resources.visualizationFolder !== null
    ) {
      throw new Error('Visualization folder must be a string or null');
    }
  }
}
