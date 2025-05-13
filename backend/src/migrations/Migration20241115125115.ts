import { Migration } from '@mikro-orm/migrations';

export class Migration20241115125115 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "user_property" drop constraint "user_property_user_id_unique";`,
    );
    this.addSql(
      `alter table "user_property" drop constraint "user_property_property_id_unique";`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "user_property" add constraint "user_property_user_id_unique" unique ("user_id");`,
    );
    this.addSql(
      `alter table "user_property" add constraint "user_property_property_id_unique" unique ("property_id");`,
    );
  }
}
