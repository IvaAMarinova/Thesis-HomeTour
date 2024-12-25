import { Entity, PrimaryKey, Property, JsonType, BeforeCreate, ManyToOne} from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Company } from '../company/company.entity';

@Entity()
export class PropertyEntity {
  @PrimaryKey({
    columnType: 'uuid',
    type: 'uuid',
  })
  id = v4();

  @Property()
  name!: string;

  @Property({ columnType: 'text' })
  description!: string;

  @Property({ nullable: true })
  floor: number;

  @Property({ type: JsonType })
  address!: {
    street: string;
    city: string;
    neighborhood: string;
  }

  @Property()
  phoneNumber!: string;

  @Property()
  email!: string;

  @Property({ type: JsonType })
  resources!: {
    headerImage: string;
    galleryImages: string[];
    visualizationFolder?: string;
  };

  @ManyToOne(() => Company)
  company!: Company;
}