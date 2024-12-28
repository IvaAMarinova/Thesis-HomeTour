
import { Entity, Index, ManyToOne, PrimaryKey, Property} from '@mikro-orm/core';
import { v4 } from 'uuid';
import { User } from '../user/user.entity';

@Entity()
export class Tokens {
    @PrimaryKey({
        columnType: 'uuid',
        type: 'uuid',
    })
    id = v4();

    @Property({ columnType: 'text' })
    accessToken!: string;
    
    @Property({ columnType: 'text' })
    refreshToken!: string;

    @ManyToOne(() => User)
    @Index()
    user!: User;
}