import { Migration } from '@mikro-orm/migrations';

export class Migration20241016100052 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "building" drop constraint "building_company_id_unique";`,
    );

    this.addSql(
      `alter table "property_entity" drop constraint "property_entity_company_id_unique";`,
    );
    this.addSql(
      `alter table "property_entity" drop constraint "property_entity_building_id_unique";`,
    );

    this.addSql(`alter table "user" drop constraint "user_company_id_unique";`);
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "building" add constraint "building_company_id_unique" unique ("company_id");`,
    );

    this.addSql(
      `alter table "property_entity" add constraint "property_entity_company_id_unique" unique ("company_id");`,
    );
    this.addSql(
      `alter table "property_entity" add constraint "property_entity_building_id_unique" unique ("building_id");`,
    );

    this.addSql(
      `alter table "user" add constraint "user_company_id_unique" unique ("company_id");`,
    );
  }
}
