import { Migration } from '@mikro-orm/migrations';

export class Migration20241227185718 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create index "property_entity_company_id_index" on "property_entity" ("company_id");`,
    );

    this.addSql(
      `create index "user_company_id_index" on "user" ("company_id");`,
    );

    this.addSql(`create index "tokens_user_id_index" on "tokens" ("user_id");`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop index "property_entity_company_id_index";`);

    this.addSql(`drop index "user_company_id_index";`);

    this.addSql(`drop index "tokens_user_id_index";`);
  }
}
