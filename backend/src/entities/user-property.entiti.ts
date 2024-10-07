import { Entity, PrimaryKey, Property, ManyToOne, Enum, OneToMany, OneToOne } from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';
import { User } from './user.entity';
import { PropertyEntity } from './property.enity';

@Entity()
export class UserProperty {

  @PrimaryKey()
  id: string = uuidv4();

  @OneToOne(() => User)
  user!: User;

  @OneToOne(() => PropertyEntity)
  property!: PropertyEntity;

  @Property()
  liked: boolean;
}

