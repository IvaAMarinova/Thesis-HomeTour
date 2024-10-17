import { Migration } from '@mikro-orm/migrations';

export class Migration20241017065412 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "property_entity" add column "description" varchar(255) not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "property_entity" drop column "description";`);
  }

}
