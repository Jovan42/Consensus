import { MigrationInterface, QueryRunner } from 'typeorm';

export class CompleteSchemaWithTestUsers1707000000000 implements MigrationInterface {
  name = 'CompleteSchemaWithTestUsers1707000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop existing tables if they exist (in correct order to handle foreign keys)
    await queryRunner.query(`DROP TABLE IF EXISTS "completions" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "votes" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "recommendations" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "rounds" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "members" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "clubs" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_settings" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "notifications" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "member_notes" CASCADE`);

    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "name" character varying NOT NULL,
        "picture" character varying,
        "role" character varying NOT NULL DEFAULT 'user',
        "isActive" boolean NOT NULL DEFAULT true,
        "banned" boolean NOT NULL DEFAULT false,
        "banReason" text,
        "bannedAt" TIMESTAMP,
        "lastLoginAt" TIMESTAMP,
        "emailVerified" boolean NOT NULL DEFAULT false,
        "timezone" character varying,
        "locale" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email")
      )
    `);

    // Create user_settings table
    await queryRunner.query(`
      CREATE TABLE "user_settings" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "theme" character varying NOT NULL DEFAULT 'system',
        "showOnlineStatus" boolean NOT NULL DEFAULT true,
        "enableNotifications" boolean NOT NULL DEFAULT true,
        "enableNotificationSound" boolean NOT NULL DEFAULT true,
        "notificationSound" character varying NOT NULL DEFAULT 'default',
        "notificationDuration" integer NOT NULL DEFAULT 5000,
        "emailNotifications" boolean NOT NULL DEFAULT true,
        "pushNotifications" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_settings" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_settings_userId" UNIQUE ("userId")
      )
    `);

    // Create clubs table
    await queryRunner.query(`
      CREATE TABLE "clubs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "type" character varying NOT NULL DEFAULT 'book',
        "config" jsonb NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_clubs" PRIMARY KEY ("id")
      )
    `);

    // Create members table
    await queryRunner.query(`
      CREATE TABLE "members" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "email" character varying,
        "clubId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_members" PRIMARY KEY ("id")
      )
    `);

    // Create rounds table
    await queryRunner.query(`
      CREATE TABLE "rounds" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "clubId" uuid NOT NULL,
        "currentRecommenderId" uuid NOT NULL,
        "status" character varying NOT NULL DEFAULT 'recommending',
        "winningRecommendationId" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_rounds" PRIMARY KEY ("id")
      )
    `);

    // Create recommendations table
    await queryRunner.query(`
      CREATE TABLE "recommendations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying NOT NULL,
        "description" character varying,
        "roundId" uuid NOT NULL,
        "recommenderId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_recommendations" PRIMARY KEY ("id")
      )
    `);

    // Create votes table
    await queryRunner.query(`
      CREATE TABLE "votes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "points" integer NOT NULL,
        "memberId" uuid NOT NULL,
        "recommendationId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_votes" PRIMARY KEY ("id")
      )
    `);

    // Create completions table
    await queryRunner.query(`
      CREATE TABLE "completions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "memberId" uuid NOT NULL,
        "recommendationId" uuid NOT NULL,
        "isCompleted" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_completions" PRIMARY KEY ("id")
      )
    `);

    // Create member_notes table
    await queryRunner.query(`
      CREATE TABLE "member_notes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "memberId" uuid NOT NULL,
        "roundId" uuid NOT NULL,
        "note" text NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_member_notes" PRIMARY KEY ("id")
      )
    `);

    // Create notifications table
    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userEmail" character varying NOT NULL,
        "type" character varying NOT NULL,
        "title" character varying NOT NULL,
        "message" text NOT NULL,
        "data" jsonb,
        "isRead" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notifications" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "user_settings" 
      ADD CONSTRAINT "FK_user_settings_user" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "members" 
      ADD CONSTRAINT "FK_members_club" 
      FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "rounds" 
      ADD CONSTRAINT "FK_rounds_club" 
      FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "rounds" 
      ADD CONSTRAINT "FK_rounds_recommender" 
      FOREIGN KEY ("currentRecommenderId") REFERENCES "members"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "recommendations" 
      ADD CONSTRAINT "FK_recommendations_round" 
      FOREIGN KEY ("roundId") REFERENCES "rounds"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "recommendations" 
      ADD CONSTRAINT "FK_recommendations_recommender" 
      FOREIGN KEY ("recommenderId") REFERENCES "members"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "votes" 
      ADD CONSTRAINT "FK_votes_member" 
      FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "votes" 
      ADD CONSTRAINT "FK_votes_recommendation" 
      FOREIGN KEY ("recommendationId") REFERENCES "recommendations"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "completions" 
      ADD CONSTRAINT "FK_completions_member" 
      FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "completions" 
      ADD CONSTRAINT "FK_completions_recommendation" 
      FOREIGN KEY ("recommendationId") REFERENCES "recommendations"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "member_notes" 
      ADD CONSTRAINT "FK_member_notes_member" 
      FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "member_notes" 
      ADD CONSTRAINT "FK_member_notes_round" 
      FOREIGN KEY ("roundId") REFERENCES "rounds"("id") ON DELETE CASCADE
    `);

    // Create indexes for better performance
    await queryRunner.query(`CREATE INDEX "IDX_users_email" ON "users" ("email")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_role" ON "users" ("role")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_banned" ON "users" ("banned")`);
    await queryRunner.query(`CREATE INDEX "IDX_members_clubId" ON "members" ("clubId")`);
    await queryRunner.query(`CREATE INDEX "IDX_rounds_clubId" ON "rounds" ("clubId")`);
    await queryRunner.query(`CREATE INDEX "IDX_rounds_status" ON "rounds" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_recommendations_roundId" ON "recommendations" ("roundId")`);
    await queryRunner.query(`CREATE INDEX "IDX_votes_memberId" ON "votes" ("memberId")`);
    await queryRunner.query(`CREATE INDEX "IDX_votes_recommendationId" ON "votes" ("recommendationId")`);
    await queryRunner.query(`CREATE INDEX "IDX_completions_memberId" ON "completions" ("memberId")`);
    await queryRunner.query(`CREATE INDEX "IDX_completions_recommendationId" ON "completions" ("recommendationId")`);
    await queryRunner.query(`CREATE INDEX "IDX_member_notes_memberId" ON "member_notes" ("memberId")`);
    await queryRunner.query(`CREATE INDEX "IDX_member_notes_roundId" ON "member_notes" ("roundId")`);
    await queryRunner.query(`CREATE INDEX "IDX_notifications_userEmail" ON "notifications" ("userEmail")`);
    await queryRunner.query(`CREATE INDEX "IDX_notifications_type" ON "notifications" ("type")`);
    await queryRunner.query(`CREATE INDEX "IDX_notifications_isRead" ON "notifications" ("isRead")`);

    // Insert test users
    await queryRunner.query(`
      INSERT INTO "users" ("id", "email", "name", "picture", "role", "isActive", "banned", "emailVerified", "timezone", "locale", "createdAt", "updatedAt") VALUES
      ('550e8400-e29b-41d4-a716-446655440001', 'admin@test.com', 'Admin User', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face', 'admin', true, false, true, 'UTC', 'en', NOW(), NOW()),
      ('550e8400-e29b-41d4-a716-446655440002', 'manager@test.com', 'Manager User', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face', 'manager', true, false, true, 'UTC', 'en', NOW(), NOW()),
      ('550e8400-e29b-41d4-a716-446655440003', 'user1@test.com', 'John Doe', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face', 'user', true, false, true, 'UTC', 'en', NOW(), NOW()),
      ('550e8400-e29b-41d4-a716-446655440004', 'user2@test.com', 'Jane Smith', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face', 'user', true, false, true, 'UTC', 'en', NOW(), NOW()),
      ('550e8400-e29b-41d4-a716-446655440005', 'user3@test.com', 'Bob Johnson', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face', 'user', true, false, true, 'UTC', 'en', NOW(), NOW()),
      ('550e8400-e29b-41d4-a716-446655440006', 'banned@test.com', 'Banned User', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face', 'user', true, true, true, 'UTC', 'en', NOW(), NOW())
    `);

    // Insert user settings for test users
    await queryRunner.query(`
      INSERT INTO "user_settings" ("id", "userId", "theme", "showOnlineStatus", "enableNotifications", "enableNotificationSound", "notificationSound", "notificationDuration", "emailNotifications", "pushNotifications", "createdAt", "updatedAt") VALUES
      ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'system', true, true, true, 'default', 5000, true, true, NOW(), NOW()),
      ('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'system', true, true, true, 'default', 5000, true, true, NOW(), NOW()),
      ('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'system', true, true, true, 'default', 5000, true, true, NOW(), NOW()),
      ('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 'system', true, true, true, 'default', 5000, true, true, NOW(), NOW()),
      ('650e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', 'system', true, true, true, 'default', 5000, true, true, NOW(), NOW()),
      ('650e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440006', 'system', true, true, true, 'default', 5000, true, true, NOW(), NOW())
    `);

    // Update the banned user with ban details
    await queryRunner.query(`
      UPDATE "users" 
      SET "banReason" = 'Test ban for demonstration purposes', 
          "bannedAt" = NOW() - INTERVAL '1 day'
      WHERE "email" = 'banned@test.com'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop all tables in reverse order
    await queryRunner.query(`DROP TABLE IF EXISTS "notifications" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "member_notes" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "completions" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "votes" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "recommendations" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "rounds" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "members" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "clubs" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_settings" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users" CASCADE`);
  }
}
