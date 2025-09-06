import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1704067200000 implements MigrationInterface {
    name = 'InitialSchema1704067200000'

    public async up(queryRunner: QueryRunner): Promise<void> {
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

        // Add foreign key constraints
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

        // Create indexes for better performance
        await queryRunner.query(`CREATE INDEX "IDX_members_clubId" ON "members" ("clubId")`);
        await queryRunner.query(`CREATE INDEX "IDX_rounds_clubId" ON "rounds" ("clubId")`);
        await queryRunner.query(`CREATE INDEX "IDX_rounds_status" ON "rounds" ("status")`);
        await queryRunner.query(`CREATE INDEX "IDX_recommendations_roundId" ON "recommendations" ("roundId")`);
        await queryRunner.query(`CREATE INDEX "IDX_votes_memberId" ON "votes" ("memberId")`);
        await queryRunner.query(`CREATE INDEX "IDX_votes_recommendationId" ON "votes" ("recommendationId")`);
        await queryRunner.query(`CREATE INDEX "IDX_completions_memberId" ON "completions" ("memberId")`);
        await queryRunner.query(`CREATE INDEX "IDX_completions_recommendationId" ON "completions" ("recommendationId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_completions_recommendationId"`);
        await queryRunner.query(`DROP INDEX "IDX_completions_memberId"`);
        await queryRunner.query(`DROP INDEX "IDX_votes_recommendationId"`);
        await queryRunner.query(`DROP INDEX "IDX_votes_memberId"`);
        await queryRunner.query(`DROP INDEX "IDX_recommendations_roundId"`);
        await queryRunner.query(`DROP INDEX "IDX_rounds_status"`);
        await queryRunner.query(`DROP INDEX "IDX_rounds_clubId"`);
        await queryRunner.query(`DROP INDEX "IDX_members_clubId"`);

        // Drop foreign key constraints
        await queryRunner.query(`ALTER TABLE "completions" DROP CONSTRAINT "FK_completions_recommendation"`);
        await queryRunner.query(`ALTER TABLE "completions" DROP CONSTRAINT "FK_completions_member"`);
        await queryRunner.query(`ALTER TABLE "votes" DROP CONSTRAINT "FK_votes_recommendation"`);
        await queryRunner.query(`ALTER TABLE "votes" DROP CONSTRAINT "FK_votes_member"`);
        await queryRunner.query(`ALTER TABLE "recommendations" DROP CONSTRAINT "FK_recommendations_recommender"`);
        await queryRunner.query(`ALTER TABLE "recommendations" DROP CONSTRAINT "FK_recommendations_round"`);
        await queryRunner.query(`ALTER TABLE "rounds" DROP CONSTRAINT "FK_rounds_recommender"`);
        await queryRunner.query(`ALTER TABLE "rounds" DROP CONSTRAINT "FK_rounds_club"`);
        await queryRunner.query(`ALTER TABLE "members" DROP CONSTRAINT "FK_members_club"`);

        // Drop tables
        await queryRunner.query(`DROP TABLE "completions"`);
        await queryRunner.query(`DROP TABLE "votes"`);
        await queryRunner.query(`DROP TABLE "recommendations"`);
        await queryRunner.query(`DROP TABLE "rounds"`);
        await queryRunner.query(`DROP TABLE "members"`);
        await queryRunner.query(`DROP TABLE "clubs"`);
    }
}
