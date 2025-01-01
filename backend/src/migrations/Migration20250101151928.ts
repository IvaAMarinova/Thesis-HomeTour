import { Migration } from '@mikro-orm/migrations';

export class Migration20250101151928 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "user" add column "is_google_user" boolean not null default false;`);
    this.addSql(`alter table "user" alter column "password" type varchar(255) using ("password"::varchar(255));`);
    this.addSql(`alter table "user" alter column "password" drop not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "user" drop column "is_google_user";`);

    this.addSql(`alter table "user" alter column "password" type varchar(255) using ("password"::varchar(255));`);
    this.addSql(`alter table "user" alter column "password" set not null;`);
  }
}
