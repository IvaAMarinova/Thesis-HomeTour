import { Entity, PrimaryKey, Property, BeforeCreate, OneToOne } from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../user/user.entity';
import { PropertyEntity } from '../property/property.enity';

@Entity()
export class UserProperty {

  @PrimaryKey()
  id: string;

  @OneToOne(() => User)
  user!: User;

  @OneToOne(() => PropertyEntity)
  property!: PropertyEntity;

  @Property({ nullable: true })
  liked: boolean;

  @BeforeCreate()
  setId() {
    this.id = uuidv4();
  }
}

