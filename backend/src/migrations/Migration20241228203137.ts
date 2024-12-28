import { Migration } from '@mikro-orm/migrations';

export class Migration20241228203137 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "user" add column "roles" text[] not null default '{user}';`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "user" drop column "roles";`);
  }

}
