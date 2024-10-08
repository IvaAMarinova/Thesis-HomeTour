import { Entity, PrimaryKey, Property, JsonType, OneToOne, BeforeCreate} from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';
import { Company } from '../company/company.entity';
import { Building } from '../building/building.entity';

@Entity()
export class PropertyEntity {

  @PrimaryKey()
  id: string;

  @Property({ nullable: true })
  floor: number;

  @Property({ type: JsonType })
  address!: Record<string, string>;

  @Property()
  phone_number!: string;

  @Property()
  email!: string;

  @Property({ type: JsonType })
  resources!: Record<string, any>;

  @OneToOne(() => Company)
  company!: Company;

  @OneToOne(() => Building)
  building!: Building;

  @BeforeCreate()
  setId() {
    this.id = uuidv4();
  }
}
