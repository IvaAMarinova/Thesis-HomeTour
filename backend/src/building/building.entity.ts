import { Entity, JsonType, ManyToOne, PrimaryKey, Property, BeforeCreate} from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Company } from '../company/company.entity';

@Entity()
export class Building {
    @PrimaryKey({
        columnType: 'uuid',
        type: 'uuid',
    })
    id = v4();

    @Property()
    name!: string;

    @Property({ columnType: 'text' })
    description!: string;

    @Property({ type: JsonType })
    address!: Record<string, any>;

    @ManyToOne(() => Company, { nullable: true })
    company?: Company;
}