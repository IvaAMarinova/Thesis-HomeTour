import { Migration } from '@mikro-orm/migrations';

export class Migration20241226170729 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "tokens" ("id" uuid not null, "access_token" varchar(255) not null, "refresh_token" varchar(255) not null, "user_id" uuid not null, constraint "tokens_pkey" primary key ("id"));`);

    this.addSql(`alter table "tokens" add constraint "tokens_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`);

    this.addSql(`alter table "user" drop column "access_token", drop column "refresh_token";`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "tokens" cascade;`);

    this.addSql(`alter table "user" add column "access_token" varchar(255) null, add column "refresh_token" varchar(255) null;`);
  }

}
