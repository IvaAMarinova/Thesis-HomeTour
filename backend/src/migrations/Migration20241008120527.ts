import { Migration } from '@mikro-orm/migrations';

export class Migration20241008120527 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "property_entity" ("id" varchar(255) not null, "floor" int null, "address" jsonb not null, "phone_number" varchar(255) not null, "email" varchar(255) not null, "resources" jsonb not null, "company_id" varchar(255) not null, "building_id" varchar(255) not null, constraint "property_entity_pkey" primary key ("id"));`);
    this.addSql(`alter table "property_entity" add constraint "property_entity_company_id_unique" unique ("company_id");`);
    this.addSql(`alter table "property_entity" add constraint "property_entity_building_id_unique" unique ("building_id");`);

    this.addSql(`create table "user_property" ("id" varchar(255) not null, "user_id" varchar(255) not null, "property_id" varchar(255) not null, "liked" boolean null, constraint "user_property_pkey" primary key ("id"));`);
    this.addSql(`alter table "user_property" add constraint "user_property_user_id_unique" unique ("user_id");`);
    this.addSql(`alter table "user_property" add constraint "user_property_property_id_unique" unique ("property_id");`);

    this.addSql(`alter table "property_entity" add constraint "property_entity_company_id_foreign" foreign key ("company_id") references "company" ("id") on update cascade;`);
    this.addSql(`alter table "property_entity" add constraint "property_entity_building_id_foreign" foreign key ("building_id") references "building" ("id") on update cascade;`);

    this.addSql(`alter table "user_property" add constraint "user_property_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`);
    this.addSql(`alter table "user_property" add constraint "user_property_property_id_foreign" foreign key ("property_id") references "property_entity" ("id") on update cascade;`);

    this.addSql(`alter table "user" drop constraint "user_company_id_foreign";`);

    this.addSql(`alter table "user" alter column "company_id" type varchar(255) using ("company_id"::varchar(255));`);
    this.addSql(`alter table "user" alter column "company_id" drop not null;`);
    this.addSql(`alter table "user" add constraint "user_company_id_foreign" foreign key ("company_id") references "company" ("id") on update cascade on delete set null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "user_property" drop constraint "user_property_property_id_foreign";`);

    this.addSql(`drop table if exists "property_entity" cascade;`);

    this.addSql(`drop table if exists "user_property" cascade;`);

    this.addSql(`alter table "user" drop constraint "user_company_id_foreign";`);

    this.addSql(`alter table "user" alter column "company_id" type varchar(255) using ("company_id"::varchar(255));`);
    this.addSql(`alter table "user" alter column "company_id" set not null;`);
    this.addSql(`alter table "user" add constraint "user_company_id_foreign" foreign key ("company_id") references "company" ("id") on update cascade on delete no action;`);
  }

}
