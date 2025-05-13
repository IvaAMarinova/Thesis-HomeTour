import { Migration } from '@mikro-orm/migrations';

export class Migration20241018120507 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "property_entity" alter column "resources" type jsonb using ("resources"::jsonb);`,
    );
    this.addSql(
      `alter table "property_entity" alter column "resources" drop not null;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "property_entity" alter column "resources" type jsonb using ("resources"::jsonb);`,
    );
    this.addSql(
      `alter table "property_entity" alter column "resources" set not null;`,
    );
  }
}
