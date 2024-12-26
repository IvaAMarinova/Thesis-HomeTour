import { Injectable } from '@nestjs/common';
import { MikroORM } from '@mikro-orm/core';

@Injectable()
export class AppService {
  constructor(private readonly orm: MikroORM) {}
}
