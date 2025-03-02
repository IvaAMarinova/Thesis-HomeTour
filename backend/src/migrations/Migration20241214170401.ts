import { Migration } from '@mikro-orm/migrations';

export class MigrationYYYYMMDDHHMMSS extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      ALTER TABLE "property_entity" 
      ALTER COLUMN "address" TYPE JSONB 
      USING "address"::JSONB;
    `);

    this.addSql(`
      COMMENT ON COLUMN "property_entity"."address" IS 
      'Structure: { street: string, city: string, neighborhood: string, number?: string }';
    `);
  }

  async down(): Promise<void> {
    this.addSql(`
      ALTER TABLE "property_entity" 
      ALTER COLUMN "address" TYPE JSON 
      USING "address"::JSON;
    `);

    this.addSql(`
      COMMENT ON COLUMN "property_entity"."address" IS NULL;
    `);
  }
}
