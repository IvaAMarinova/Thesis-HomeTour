import { Migration } from '@mikro-orm/migrations';

export class Migration20241227174335 extends Migration {

  async up(): Promise<void> {
    this.addSql(`
      ALTER TABLE "user_property"
      DROP CONSTRAINT IF EXISTS "user_property_property_id_foreign";
    `);

    this.addSql(`
      ALTER TABLE "user_property"
      ADD CONSTRAINT "user_property_property_id_foreign"
      FOREIGN KEY ("property_id")
      REFERENCES "property_entity" ("id")
      ON DELETE CASCADE;
    `);
  }

  async down(): Promise<void> {
    this.addSql(`
      ALTER TABLE "user_property"
      DROP CONSTRAINT "user_property_property_id_foreign";
    `);

    this.addSql(`
      ALTER TABLE "user_property"
      ADD CONSTRAINT "user_property_property_id_foreign"
      FOREIGN KEY ("property_id")
      REFERENCES "property_entity" ("id");
    `);
  }

}
