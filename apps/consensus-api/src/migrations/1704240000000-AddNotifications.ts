import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNotifications1704240000000 implements MigrationInterface {
  name = 'AddNotifications1704240000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create notification_type enum
    await queryRunner.query(`
      CREATE TYPE "notification_type_enum" AS ENUM(
        'vote_cast',
        'voting_completed',
        'recommendation_added',
        'round_started',
        'round_completed',
        'member_added',
        'member_removed',
        'member_role_changed',
        'club_updated'
      )
    `);

    // Create notification_status enum
    await queryRunner.query(`
      CREATE TYPE "notification_status_enum" AS ENUM('unread', 'read')
    `);

    // Create notifications table
    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "type" "notification_type_enum" NOT NULL,
        "status" "notification_status_enum" NOT NULL DEFAULT 'unread',
        "title" character varying NOT NULL,
        "message" text NOT NULL,
        "data" jsonb,
        "memberId" uuid NOT NULL,
        "clubId" uuid NOT NULL,
        "roundId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notifications" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "notifications" 
      ADD CONSTRAINT "FK_notifications_member_id" 
      FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "notifications" 
      ADD CONSTRAINT "FK_notifications_club_id" 
      FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "notifications" 
      ADD CONSTRAINT "FK_notifications_round_id" 
      FOREIGN KEY ("roundId") REFERENCES "rounds"("id") ON DELETE CASCADE
    `);

    // Create indexes for better performance
    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_member_id" ON "notifications" ("memberId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_club_id" ON "notifications" ("clubId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_round_id" ON "notifications" ("roundId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_status" ON "notifications" ("status")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_created_at" ON "notifications" ("createdAt")
    `);

    // Create composite index for member status queries
    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_member_status" ON "notifications" ("memberId", "status")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop table (this will automatically drop indexes and constraints)
    await queryRunner.query(`DROP TABLE "notifications"`);
    
    // Drop enums
    await queryRunner.query(`DROP TYPE "notification_type_enum"`);
    await queryRunner.query(`DROP TYPE "notification_status_enum"`);
  }
}
