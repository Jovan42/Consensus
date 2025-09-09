import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateUserTables1704000000000 implements MigrationInterface {
  name = 'CreateUserTables1704000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'email',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'picture',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'role',
            type: 'varchar',
            default: "'user'",
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'lastLoginAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'emailVerified',
            type: 'boolean',
            default: false,
          },
          {
            name: 'timezone',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'locale',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    );

    // Create user_settings table
    await queryRunner.createTable(
      new Table({
        name: 'user_settings',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'userId',
            type: 'uuid',
          },
          {
            name: 'theme',
            type: 'varchar',
            default: "'system'",
          },
          {
            name: 'showOnlineStatus',
            type: 'boolean',
            default: true,
          },
          {
            name: 'enableNotifications',
            type: 'boolean',
            default: true,
          },
          {
            name: 'enableNotificationSound',
            type: 'boolean',
            default: true,
          },
          {
            name: 'notificationSound',
            type: 'varchar',
            default: "'default'",
          },
          {
            name: 'notificationDuration',
            type: 'integer',
            default: 5000,
          },
          {
            name: 'emailNotifications',
            type: 'boolean',
            default: true,
          },
          {
            name: 'pushNotifications',
            type: 'boolean',
            default: true,
          },
          {
            name: 'language',
            type: 'varchar',
            default: "'en'",
          },
          {
            name: 'itemsPerPage',
            type: 'integer',
            default: 12,
          },
          {
            name: 'showProfilePicture',
            type: 'boolean',
            default: true,
          },
          {
            name: 'showEmailInProfile',
            type: 'boolean',
            default: true,
          },
          {
            name: 'autoJoinClubs',
            type: 'boolean',
            default: false,
          },
          {
            name: 'showVoteProgress',
            type: 'boolean',
            default: true,
          },
          {
            name: 'showCompletionProgress',
            type: 'boolean',
            default: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    );

    // Add foreign key constraint
    await queryRunner.createForeignKey(
      'user_settings',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      })
    );

    // Insert test users
    await queryRunner.query(`
      INSERT INTO users (id, email, name, picture, role, isActive, emailVerified, timezone, locale, "createdAt", "updatedAt") VALUES
      ('550e8400-e29b-41d4-a716-446655440001', 'admin@consensus.com', 'Admin User', 'https://via.placeholder.com/150/007bff/ffffff?text=A', 'admin', true, true, 'UTC', 'en', NOW(), NOW()),
      ('550e8400-e29b-41d4-a716-446655440002', 'john.doe@example.com', 'John Doe', 'https://via.placeholder.com/150/28a745/ffffff?text=J', 'user', true, true, 'UTC', 'en', NOW(), NOW()),
      ('550e8400-e29b-41d4-a716-446655440003', 'jane.smith@example.com', 'Jane Smith', 'https://via.placeholder.com/150/dc3545/ffffff?text=J', 'user', true, true, 'UTC', 'en', NOW(), NOW()),
      ('550e8400-e29b-41d4-a716-446655440004', 'bob.wilson@example.com', 'Bob Wilson', 'https://via.placeholder.com/150/ffc107/000000?text=B', 'user', true, true, 'UTC', 'en', NOW(), NOW()),
      ('550e8400-e29b-41d4-a716-446655440005', 'alice.brown@example.com', 'Alice Brown', 'https://via.placeholder.com/150/6f42c1/ffffff?text=A', 'user', true, true, 'UTC', 'en', NOW(), NOW()),
      ('550e8400-e29b-41d4-a716-446655440006', 'charlie.davis@example.com', 'Charlie Davis', 'https://via.placeholder.com/150/20c997/ffffff?text=C', 'user', true, true, 'UTC', 'en', NOW(), NOW()),
      ('550e8400-e29b-41d4-a716-446655440007', 'diana.miller@example.com', 'Diana Miller', 'https://via.placeholder.com/150/fd7e14/ffffff?text=D', 'user', true, true, 'UTC', 'en', NOW(), NOW()),
      ('550e8400-e29b-41d4-a716-446655440008', 'eve.jones@example.com', 'Eve Jones', 'https://via.placeholder.com/150/e83e8c/ffffff?text=E', 'user', true, true, 'UTC', 'en', NOW(), NOW())
    `);

    // Insert default settings for test users
    await queryRunner.query(`
      INSERT INTO user_settings (id, "userId", theme, "showOnlineStatus", "enableNotifications", "enableNotificationSound", "notificationSound", "notificationDuration", "emailNotifications", "pushNotifications", language, "itemsPerPage", "showProfilePicture", "showEmailInProfile", "autoJoinClubs", "showVoteProgress", "showCompletionProgress", "createdAt", "updatedAt") VALUES
      ('settings-550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'dark', true, true, true, 'default', 5000, true, true, 'en', 12, true, true, false, true, true, NOW(), NOW()),
      ('settings-550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'light', true, true, true, 'chime', 3000, true, true, 'en', 12, true, true, false, true, true, NOW(), NOW()),
      ('settings-550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'system', true, true, false, 'none', 7000, true, false, 'en', 12, true, false, false, true, true, NOW(), NOW()),
      ('settings-550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 'dark', false, true, true, 'bell', 4000, false, true, 'en', 12, true, true, true, true, true, NOW(), NOW()),
      ('settings-550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', 'light', true, false, false, 'none', 5000, false, false, 'en', 12, false, true, false, true, true, NOW(), NOW()),
      ('settings-550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440006', 'system', true, true, true, 'default', 5000, true, true, 'en', 12, true, true, false, true, true, NOW(), NOW()),
      ('settings-550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440007', 'dark', true, true, true, 'chime', 6000, true, true, 'en', 12, true, true, false, true, true, NOW(), NOW()),
      ('settings-550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440008', 'light', true, true, true, 'bell', 5000, true, true, 'en', 12, true, true, false, true, true, NOW(), NOW())
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_settings');
    await queryRunner.dropTable('users');
  }
}
