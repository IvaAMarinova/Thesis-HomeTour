import { Migration } from '@mikro-orm/migrations';

export class Migration20241227185333 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create index "user_property_user_id_index" on "user_property" ("user_id");`,
    );
    this.addSql(
      `create index "user_property_property_id_index" on "user_property" ("property_id");`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop index "user_property_user_id_index";`);
    this.addSql(`drop index "user_property_property_id_index";`);
  }
}
