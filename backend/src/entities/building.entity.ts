import { Entity, JsonType, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';
import { Company } from './company.entity';

@Entity()
export class Building {
    @PrimaryKey()
    id: string = uuidv4();

    @Property()
    name!: string;

    @Property({ type: JsonType }) 
    address!: any;

    @OneToOne(() => Company)
    company!: Company;
}
