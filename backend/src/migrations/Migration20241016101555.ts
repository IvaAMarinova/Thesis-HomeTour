import { Migration } from '@mikro-orm/migrations';

export class Migration20241016101555 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "property_entity" add column "name" varchar(255) not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "property_entity" drop column "name";`);
  }

}
