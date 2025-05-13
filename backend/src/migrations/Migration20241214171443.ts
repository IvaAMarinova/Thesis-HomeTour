import { Migration } from '@mikro-orm/migrations';

export class MigrationYYYYMMDDHHMMSS extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      COMMENT ON COLUMN "property_entity"."address" IS 
      'Structure: { street: string, city: string, neighborhood: string }';
    `);
  }

  async down(): Promise<void> {
    this.addSql(`
      COMMENT ON COLUMN "property_entity"."address" IS 
      'Structure: { street: string, city: string, neighborhood: string, number?: string }';
    `);
  }
}
