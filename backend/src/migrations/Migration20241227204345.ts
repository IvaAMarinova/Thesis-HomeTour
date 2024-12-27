import { Migration } from '@mikro-orm/migrations';

export class Migration20241227204345 extends Migration {

  async up(): Promise<void> {
    this.addSql(`
      ALTER TABLE "user_property"
      DROP CONSTRAINT IF EXISTS "user_property_user_id_foreign";
    `);

    this.addSql(`
      ALTER TABLE "user_property"
      ADD CONSTRAINT "user_property_user_id_foreign"
      FOREIGN KEY ("user_id")
      REFERENCES "user" ("id")
      ON DELETE CASCADE;
    `);
  }

  async down(): Promise<void> {
    this.addSql(`
      ALTER TABLE "user_property"
      DROP CONSTRAINT "user_property_user_id_foreign";
    `);

    this.addSql(`
      ALTER TABLE "user_property"
      ADD CONSTRAINT "user_property_user_id_foreign"
      FOREIGN KEY ("user_id")
      REFERENCES "user" ("id");
    `);
  }

}