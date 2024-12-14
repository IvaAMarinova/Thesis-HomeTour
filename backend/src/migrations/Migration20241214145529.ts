import { Migration } from '@mikro-orm/migrations';

export class Migration20241214145529 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "company" alter column "resources" type jsonb using ("resources"::jsonb);`);
    this.addSql(`alter table "company" alter column "resources" set not null;`);

    this.addSql(`alter table "property_entity" alter column "resources" type jsonb using ("resources"::jsonb);`);
    this.addSql(`alter table "property_entity" alter column "resources" set not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "company" alter column "resources" type jsonb using ("resources"::jsonb);`);
    this.addSql(`alter table "company" alter column "resources" drop not null;`);

    this.addSql(`alter table "property_entity" alter column "resources" type jsonb using ("resources"::jsonb);`);
    this.addSql(`alter table "property_entity" alter column "resources" drop not null;`);
  }

}
