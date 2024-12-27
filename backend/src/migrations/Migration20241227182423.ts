import { Migration } from '@mikro-orm/migrations';

export class Migration20241227182423 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "company" alter column "name" type varchar(100) using ("name"::varchar(100));`);
    this.addSql(`alter table "company" alter column "phone_number" type varchar(15) using ("phone_number"::varchar(15));`);

    this.addSql(`alter table "property_entity" alter column "name" type varchar(100) using ("name"::varchar(100));`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "company" alter column "name" type varchar(255) using ("name"::varchar(255));`);
    this.addSql(`alter table "company" alter column "phone_number" type varchar(255) using ("phone_number"::varchar(255));`);

    this.addSql(`alter table "property_entity" alter column "name" type varchar(255) using ("name"::varchar(255));`);
  }

}
