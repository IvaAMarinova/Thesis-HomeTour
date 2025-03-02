import { Migration } from '@mikro-orm/migrations';

export class Migration20241228212432 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "tokens" alter column "access_token" type text using ("access_token"::text);`,
    );
    this.addSql(
      `alter table "tokens" alter column "refresh_token" type text using ("refresh_token"::text);`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "tokens" alter column "access_token" type varchar(255) using ("access_token"::varchar(255));`,
    );
    this.addSql(
      `alter table "tokens" alter column "refresh_token" type varchar(255) using ("refresh_token"::varchar(255));`,
    );
  }
}
