import { Migration } from '@mikro-orm/migrations';

export class Migration20241225171224 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "property_entity" drop constraint "property_entity_building_id_foreign";`);

    this.addSql(`drop table if exists "building" cascade;`);

    this.addSql(`alter table "property_entity" drop column "building_id";`);
  }

  override async down(): Promise<void> {
    this.addSql(`create table "building" ("id" uuid not null, "name" varchar(255) not null, "description" text not null, "address" jsonb not null, "company_id" uuid null, constraint "building_pkey" primary key ("id"));`);

    this.addSql(`alter table "building" add constraint "building_company_id_foreign" foreign key ("company_id") references "company" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "property_entity" add column "building_id" uuid null;`);
    this.addSql(`alter table "property_entity" add constraint "property_entity_building_id_foreign" foreign key ("building_id") references "building" ("id") on update cascade on delete set null;`);
  }

}
