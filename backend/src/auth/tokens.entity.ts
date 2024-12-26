
import { Entity, ManyToOne, PrimaryKey, Property} from '@mikro-orm/core';
import { v4 } from 'uuid';
import { User } from '../user/user.entity';

@Entity()
export class Tokens {
    @PrimaryKey({
        columnType: 'uuid',
        type: 'uuid',
    })
    id = v4();

    @Property()
    accessToken!: string;

    @Property()
    refreshToken!: string;

    @ManyToOne(() => User)
    user!: User;
}