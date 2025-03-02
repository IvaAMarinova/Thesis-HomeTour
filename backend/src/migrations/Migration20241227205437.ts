import { Migration } from '@mikro-orm/migrations';

export class Migration20241227205437 extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      ALTER TABLE "tokens"
      DROP CONSTRAINT IF EXISTS "tokens_user_id_foreign";
    `);

    this.addSql(`
      ALTER TABLE "tokens"
      ADD CONSTRAINT "tokens_user_id_foreign"
      FOREIGN KEY ("user_id")
      REFERENCES "user" ("id")
      ON DELETE CASCADE;
    `);
  }

  async down(): Promise<void> {
    this.addSql(`
      ALTER TABLE "tokens"
      DROP CONSTRAINT "tokens_user_id_foreign";
    `);

    this.addSql(`
      ALTER TABLE "tokens"
      ADD CONSTRAINT "tokens_user_id_foreign"
      FOREIGN KEY ("user_id")
      REFERENCES "user" ("id");
    `);
  }
}
