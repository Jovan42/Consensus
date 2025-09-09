import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { UserSettings } from '../entities/UserSettings';

async function populateDemoUsers() {
  try {
    console.log('🔄 Connecting to database...');
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    const userRepository = AppDataSource.getRepository(User);
    const userSettingsRepository = AppDataSource.getRepository(UserSettings);

    // Demo users from auth0.ts
    const demoUsers = [
      // Admin users (3 admins)
      {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'alexander.thompson@consensus.dev',
        name: 'Alexander Thompson',
        picture: 'https://via.placeholder.com/150',
        role: 'admin',
        isActive: true,
        banned: false,
        emailVerified: true,
        timezone: 'UTC',
        locale: 'en'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        email: 'maya.patel@consensus.dev',
        name: 'Maya Patel',
        picture: 'https://via.placeholder.com/150',
        role: 'admin',
        isActive: true,
        banned: false,
        emailVerified: true,
        timezone: 'UTC',
        locale: 'en'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        email: 'james.rodriguez@consensus.dev',
        name: 'James Rodriguez',
        picture: 'https://via.placeholder.com/150',
        role: 'admin',
        isActive: true,
        banned: false,
        emailVerified: true,
        timezone: 'UTC',
        locale: 'en'
      },
      
      // Regular members (6 members)
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        email: 'sophia.chen@consensus.dev',
        name: 'Sophia Chen',
        picture: 'https://via.placeholder.com/150',
        role: 'user',
        isActive: true,
        banned: false,
        emailVerified: true,
        timezone: 'UTC',
        locale: 'en'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        email: 'michael.johnson@consensus.dev',
        name: 'Michael Johnson',
        picture: 'https://via.placeholder.com/150',
        role: 'user',
        isActive: true,
        banned: false,
        emailVerified: true,
        timezone: 'UTC',
        locale: 'en'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440005',
        email: 'emma.williams@consensus.dev',
        name: 'Emma Williams',
        picture: 'https://via.placeholder.com/150',
        role: 'user',
        isActive: true,
        banned: false,
        emailVerified: true,
        timezone: 'UTC',
        locale: 'en'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440006',
        email: 'oliver.brown@consensus.dev',
        name: 'Oliver Brown',
        picture: 'https://via.placeholder.com/150',
        role: 'user',
        isActive: true,
        banned: false,
        emailVerified: true,
        timezone: 'UTC',
        locale: 'en'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440007',
        email: 'ava.davis@consensus.dev',
        name: 'Ava Davis',
        picture: 'https://via.placeholder.com/150',
        role: 'user',
        isActive: true,
        banned: false,
        emailVerified: true,
        timezone: 'UTC',
        locale: 'en'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440008',
        email: 'liam.miller@consensus.dev',
        name: 'Liam Miller',
        picture: 'https://via.placeholder.com/150',
        role: 'user',
        isActive: true,
        banned: false,
        emailVerified: true,
        timezone: 'UTC',
        locale: 'en'
      },
      
      // Additional test user for ban functionality
      {
        id: '550e8400-e29b-41d4-a716-446655440009',
        email: 'banned@test.com',
        name: 'Banned User',
        picture: 'https://via.placeholder.com/150',
        role: 'user',
        isActive: true,
        banned: true,
        banReason: 'Test ban for demonstration purposes',
        bannedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        emailVerified: true,
        timezone: 'UTC',
        locale: 'en'
      }
    ];

    console.log('🔄 Creating demo users...');
    for (const userData of demoUsers) {
      // Check if user already exists
      const existingUser = await userRepository.findOne({ where: { email: userData.email } });
      if (existingUser) {
        console.log(`⚠️  User ${userData.email} already exists, skipping...`);
        continue;
      }

      const user = userRepository.create(userData);
      await userRepository.save(user);
      console.log(`✅ Created user: ${userData.name} (${userData.email})`);

      // Create default user settings
      const userSettings = userSettingsRepository.create({
        userId: user.id,
        theme: 'system',
        showOnlineStatus: true,
        enableNotifications: true,
        enableNotificationSound: true,
        notificationSound: 'default',
        notificationDuration: 5000,
        emailNotifications: true,
        pushNotifications: true,
        language: 'en',
        itemsPerPage: 12,
        showProfilePicture: true,
        showEmailInProfile: true,
        autoJoinClubs: false,
        showVoteProgress: true,
        showCompletionProgress: true
      });

      await userSettingsRepository.save(userSettings);
      console.log(`✅ Created settings for: ${userData.name}`);
    }

    console.log('✅ Demo users and settings created successfully');
    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Error populating demo users:', error);
    process.exit(1);
  }
}

populateDemoUsers();
