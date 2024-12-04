import { Migration } from '@mikro-orm/migrations';

export class Migration20241204085915 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "user" add column "access_token" varchar(255) null, add column "refresh_token" varchar(255) null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "user" drop column "access_token", drop column "refresh_token";`);
  }

}
