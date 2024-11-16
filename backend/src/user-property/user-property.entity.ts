import { Entity, PrimaryKey, Property, BeforeCreate, ManyToOne } from '@mikro-orm/core';
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
  user!: User;

  @ManyToOne(() => PropertyEntity)
  property!: PropertyEntity;

  @Property({ nullable: true })
  liked: boolean;
}