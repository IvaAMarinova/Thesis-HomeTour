import { Entity, JsonType, OneToOne, PrimaryKey, Property, BeforeCreate} from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';
import { Company } from '../company/company.entity';
  
@Entity()
export class Building {
    @PrimaryKey()
    id: string;

    @Property()
    name!: string;

    @Property({ type: JsonType })
    address!: Record<string, any>;

    @OneToOne(() => Company)
    company!: Company;

    @BeforeCreate()
    setId() {
        this.id = uuidv4();
}
}
  