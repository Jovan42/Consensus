import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMemberNotes1704153600000 implements MigrationInterface {
  name = 'AddMemberNotes1704153600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create member_notes table
    await queryRunner.query(`
      CREATE TABLE "member_notes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "content" text,
        "title" character varying(255),
        "member_id" uuid NOT NULL,
        "round_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_member_notes" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "member_notes" 
      ADD CONSTRAINT "FK_member_notes_member_id" 
      FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "member_notes" 
      ADD CONSTRAINT "FK_member_notes_round_id" 
      FOREIGN KEY ("round_id") REFERENCES "rounds"("id") ON DELETE CASCADE
    `);

    // Create indexes for better performance
    await queryRunner.query(`
      CREATE INDEX "IDX_member_notes_member_id" ON "member_notes" ("member_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_member_notes_round_id" ON "member_notes" ("round_id")
    `);

    // Create unique index to ensure one note per member per round
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_member_notes_member_round_unique" ON "member_notes" ("member_id", "round_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop table (this will automatically drop indexes and constraints)
    await queryRunner.query(`DROP TABLE "member_notes"`);
  }
}
