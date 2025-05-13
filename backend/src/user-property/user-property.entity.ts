import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  BeforeCreate,
  BeforeUpdate,
  Index,
} from '@mikro-orm/core';
import { v4 } from 'uuid';
import { User } from '../user/user.entity';
import { PropertyEntity } from '../property/property.entity';

@Entity()
export class UserProperty {
  @PrimaryKey({
    columnType: 'uuid',
    type: 'uuid',
  })
  id = v4();

  @ManyToOne(() => User)
  @Index()
  user!: User;

  @ManyToOne(() => PropertyEntity)
  @Index()
  property!: PropertyEntity;

  @Property({ nullable: true })
  liked: boolean;

  @BeforeCreate()
  @BeforeUpdate()
  validate() {
    if (!(this.user && typeof this.user === 'object')) {
      throw new Error('User must be a valid object');
    }

    if (!(this.property && typeof this.property === 'object')) {
      throw new Error('Property must be a valid object');
    }

    if (this.liked !== undefined && typeof this.liked !== 'boolean') {
      throw new Error('Liked must be a boolean');
    }
  }
}
