import { Migration } from '@mikro-orm/migrations';

export class Migration20241116195028 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "building" drop constraint "building_company_id_foreign";`,
    );

    this.addSql(
      `alter table "property_entity" drop constraint "property_entity_company_id_foreign";`,
    );
    this.addSql(
      `alter table "property_entity" drop constraint "property_entity_building_id_foreign";`,
    );

    this.addSql(
      `alter table "user" drop constraint "user_company_id_foreign";`,
    );

    this.addSql(
      `alter table "user_property" drop constraint "user_property_user_id_foreign";`,
    );
    this.addSql(
      `alter table "user_property" drop constraint "user_property_property_id_foreign";`,
    );

    this.addSql(`alter table "company" alter column "id" drop default;`);
    this.addSql(
      `alter table "company" alter column "id" type uuid using ("id"::text::uuid);`,
    );

    this.addSql(`alter table "building" alter column "id" drop default;`);
    this.addSql(
      `alter table "building" alter column "id" type uuid using ("id"::text::uuid);`,
    );
    this.addSql(
      `alter table "building" alter column "company_id" drop default;`,
    );
    this.addSql(
      `alter table "building" alter column "company_id" type uuid using ("company_id"::text::uuid);`,
    );
    this.addSql(
      `alter table "building" add constraint "building_company_id_foreign" foreign key ("company_id") references "company" ("id") on update cascade on delete set null;`,
    );

    this.addSql(
      `alter table "property_entity" alter column "id" drop default;`,
    );
    this.addSql(
      `alter table "property_entity" alter column "id" type uuid using ("id"::text::uuid);`,
    );
    this.addSql(
      `alter table "property_entity" alter column "company_id" drop default;`,
    );
    this.addSql(
      `alter table "property_entity" alter column "company_id" type uuid using ("company_id"::text::uuid);`,
    );
    this.addSql(
      `alter table "property_entity" alter column "building_id" drop default;`,
    );
    this.addSql(
      `alter table "property_entity" alter column "building_id" type uuid using ("building_id"::text::uuid);`,
    );
    this.addSql(
      `alter table "property_entity" add constraint "property_entity_company_id_foreign" foreign key ("company_id") references "company" ("id") on update cascade;`,
    );
    this.addSql(
      `alter table "property_entity" add constraint "property_entity_building_id_foreign" foreign key ("building_id") references "building" ("id") on update cascade on delete set null;`,
    );

    this.addSql(`alter table "user" alter column "id" drop default;`);
    this.addSql(
      `alter table "user" alter column "id" type uuid using ("id"::text::uuid);`,
    );
    this.addSql(`alter table "user" alter column "company_id" drop default;`);
    this.addSql(
      `alter table "user" alter column "company_id" type uuid using ("company_id"::text::uuid);`,
    );
    this.addSql(
      `alter table "user" add constraint "user_company_id_foreign" foreign key ("company_id") references "company" ("id") on update cascade on delete set null;`,
    );

    this.addSql(`alter table "user_property" alter column "id" drop default;`);
    this.addSql(
      `alter table "user_property" alter column "id" type uuid using ("id"::text::uuid);`,
    );
    this.addSql(
      `alter table "user_property" alter column "user_id" drop default;`,
    );
    this.addSql(
      `alter table "user_property" alter column "user_id" type uuid using ("user_id"::text::uuid);`,
    );
    this.addSql(
      `alter table "user_property" alter column "property_id" drop default;`,
    );
    this.addSql(
      `alter table "user_property" alter column "property_id" type uuid using ("property_id"::text::uuid);`,
    );
    this.addSql(
      `alter table "user_property" add constraint "user_property_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`,
    );
    this.addSql(
      `alter table "user_property" add constraint "user_property_property_id_foreign" foreign key ("property_id") references "property_entity" ("id") on update cascade;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "company" alter column "id" type text using ("id"::text);`,
    );

    this.addSql(
      `alter table "building" alter column "id" type text using ("id"::text);`,
    );
    this.addSql(
      `alter table "building" alter column "company_id" type text using ("company_id"::text);`,
    );

    this.addSql(
      `alter table "building" drop constraint "building_company_id_foreign";`,
    );

    this.addSql(
      `alter table "property_entity" alter column "id" type text using ("id"::text);`,
    );
    this.addSql(
      `alter table "property_entity" alter column "company_id" type text using ("company_id"::text);`,
    );
    this.addSql(
      `alter table "property_entity" alter column "building_id" type text using ("building_id"::text);`,
    );

    this.addSql(
      `alter table "property_entity" drop constraint "property_entity_company_id_foreign";`,
    );
    this.addSql(
      `alter table "property_entity" drop constraint "property_entity_building_id_foreign";`,
    );

    this.addSql(
      `alter table "user" alter column "id" type text using ("id"::text);`,
    );
    this.addSql(
      `alter table "user" alter column "company_id" type text using ("company_id"::text);`,
    );

    this.addSql(
      `alter table "user" drop constraint "user_company_id_foreign";`,
    );

    this.addSql(
      `alter table "user_property" alter column "id" type text using ("id"::text);`,
    );
    this.addSql(
      `alter table "user_property" alter column "user_id" type text using ("user_id"::text);`,
    );
    this.addSql(
      `alter table "user_property" alter column "property_id" type text using ("property_id"::text);`,
    );

    this.addSql(
      `alter table "user_property" drop constraint "user_property_user_id_foreign";`,
    );
    this.addSql(
      `alter table "user_property" drop constraint "user_property_property_id_foreign";`,
    );

    this.addSql(
      `alter table "company" alter column "id" type varchar(255) using ("id"::varchar(255));`,
    );

    this.addSql(
      `alter table "building" alter column "id" type varchar(255) using ("id"::varchar(255));`,
    );
    this.addSql(
      `alter table "building" alter column "company_id" type varchar(255) using ("company_id"::varchar(255));`,
    );
    this.addSql(
      `alter table "building" add constraint "building_company_id_foreign" foreign key ("company_id") references "company" ("id") on update cascade on delete set null;`,
    );

    this.addSql(
      `alter table "property_entity" alter column "id" type varchar(255) using ("id"::varchar(255));`,
    );
    this.addSql(
      `alter table "property_entity" alter column "company_id" type varchar(255) using ("company_id"::varchar(255));`,
    );
    this.addSql(
      `alter table "property_entity" alter column "building_id" type varchar(255) using ("building_id"::varchar(255));`,
    );
    this.addSql(
      `alter table "property_entity" add constraint "property_entity_company_id_foreign" foreign key ("company_id") references "company" ("id") on update cascade;`,
    );
    this.addSql(
      `alter table "property_entity" add constraint "property_entity_building_id_foreign" foreign key ("building_id") references "building" ("id") on update cascade on delete set null;`,
    );

    this.addSql(
      `alter table "user" alter column "id" type varchar(255) using ("id"::varchar(255));`,
    );
    this.addSql(
      `alter table "user" alter column "company_id" type varchar(255) using ("company_id"::varchar(255));`,
    );
    this.addSql(
      `alter table "user" add constraint "user_company_id_foreign" foreign key ("company_id") references "company" ("id") on update cascade on delete set null;`,
    );

    this.addSql(
      `alter table "user_property" alter column "id" type varchar(255) using ("id"::varchar(255));`,
    );
    this.addSql(
      `alter table "user_property" alter column "user_id" type varchar(255) using ("user_id"::varchar(255));`,
    );
    this.addSql(
      `alter table "user_property" alter column "property_id" type varchar(255) using ("property_id"::varchar(255));`,
    );
    this.addSql(
      `alter table "user_property" add constraint "user_property_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`,
    );
    this.addSql(
      `alter table "user_property" add constraint "user_property_property_id_foreign" foreign key ("property_id") references "property_entity" ("id") on update cascade;`,
    );
  }
}
