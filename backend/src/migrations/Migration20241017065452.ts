import { Migration } from '@mikro-orm/migrations';

export class Migration20241017065452 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "building" add column "description" varchar(255) not null;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "building" drop column "description";`);
  }
}
