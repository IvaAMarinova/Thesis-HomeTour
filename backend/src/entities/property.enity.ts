import { Entity, PrimaryKey, Property, JsonType, OneToOne } from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';
import { Company } from './company.entity';
import { Building } from './building.entity';

@Entity()
export class PropertyEntity {

  @PrimaryKey()
  id: string = uuidv4();

  @Property()
  floor: number;

  @Property()
  address!: string;

  @Property()
  phone_number!: string;

  @Property()
  email!: string;

  @Property({ type: JsonType })
  resources!: any;

  @OneToOne(() => Company)
  company!: Company;

  @OneToOne(() => Building)
  buildin!: Building;
}
