import { Migration } from '@mikro-orm/migrations';

export class Migration20241026130341 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "company" alter column "description" type text using ("description"::text);`);

    this.addSql(`alter table "building" alter column "description" type text using ("description"::text);`);

    this.addSql(`alter table "property_entity" alter column "description" type text using ("description"::text);`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "company" alter column "description" type varchar(255) using ("description"::varchar(255));`);

    this.addSql(`alter table "building" alter column "description" type varchar(255) using ("description"::varchar(255));`);

    this.addSql(`alter table "property_entity" alter column "description" type varchar(255) using ("description"::varchar(255));`);
  }

}
