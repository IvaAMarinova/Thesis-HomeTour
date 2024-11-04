import { Migration } from '@mikro-orm/migrations';

export class Migration20241029124145 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "building" drop constraint "building_company_id_foreign";`);

    this.addSql(`alter table "company" add column "resources" jsonb null;`);

    this.addSql(`alter table "building" alter column "company_id" type varchar(255) using ("company_id"::varchar(255));`);
    this.addSql(`alter table "building" alter column "company_id" drop not null;`);
    this.addSql(`alter table "building" add constraint "building_company_id_foreign" foreign key ("company_id") references "company" ("id") on update cascade on delete set null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "building" drop constraint "building_company_id_foreign";`);

    this.addSql(`alter table "company" drop column "resources";`);

    this.addSql(`alter table "building" alter column "company_id" type varchar(255) using ("company_id"::varchar(255));`);
    this.addSql(`alter table "building" alter column "company_id" set not null;`);
    this.addSql(`alter table "building" add constraint "building_company_id_foreign" foreign key ("company_id") references "company" ("id") on update cascade;`);
  }

}
