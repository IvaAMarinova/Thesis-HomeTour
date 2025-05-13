import { MikroORM } from '@mikro-orm/postgresql';

(async () => {
  try {
    const orm = await MikroORM.init();
    console.log(orm.em);
    console.log(orm.schema);
  } catch (error) {
    console.error('Failed to initialize MikroORM:', error);
  }
})();
