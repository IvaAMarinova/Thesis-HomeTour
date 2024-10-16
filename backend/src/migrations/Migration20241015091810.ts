import { Migration } from '@mikro-orm/migrations';

export class Migration20241015091810 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "property_entity" drop constraint "property_entity_building_id_foreign";`);

    this.addSql(`alter table "property_entity" alter column "building_id" type varchar(255) using ("building_id"::varchar(255));`);
    this.addSql(`alter table "property_entity" alter column "building_id" drop not null;`);
    this.addSql(`alter table "property_entity" add constraint "property_entity_building_id_foreign" foreign key ("building_id") references "building" ("id") on update cascade on delete set null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "property_entity" drop constraint "property_entity_building_id_foreign";`);

    this.addSql(`alter table "property_entity" alter column "building_id" type varchar(255) using ("building_id"::varchar(255));`);
    this.addSql(`alter table "property_entity" alter column "building_id" set not null;`);
    this.addSql(`alter table "property_entity" add constraint "property_entity_building_id_foreign" foreign key ("building_id") references "building" ("id") on update cascade;`);
  }

}
