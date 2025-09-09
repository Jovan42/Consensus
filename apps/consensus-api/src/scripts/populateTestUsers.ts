import 'reflect-metadata';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { UserSettings } from '../entities/UserSettings';

const testUsers = [
  {
    email: 'alexander.thompson@consensus.dev',
    name: 'Alexander Thompson',
    role: 'admin',
    picture: 'https://via.placeholder.com/150/007bff/ffffff?text=AT',
    settings: {
      theme: 'dark',
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
    }
  },
  {
    email: 'maya.patel@consensus.dev',
    name: 'Maya Patel',
    role: 'admin',
    picture: 'https://via.placeholder.com/150/28a745/ffffff?text=MP',
    settings: {
      theme: 'light',
      showOnlineStatus: true,
      enableNotifications: true,
      enableNotificationSound: true,
      notificationSound: 'chime',
      notificationDuration: 3000,
      emailNotifications: true,
      pushNotifications: true,
      language: 'en',
      itemsPerPage: 12,
      showProfilePicture: true,
      showEmailInProfile: true,
      autoJoinClubs: false,
      showVoteProgress: true,
      showCompletionProgress: true
    }
  },
  {
    email: 'james.rodriguez@consensus.dev',
    name: 'James Rodriguez',
    role: 'admin',
    picture: 'https://via.placeholder.com/150/dc3545/ffffff?text=JR',
    settings: {
      theme: 'system',
      showOnlineStatus: true,
      enableNotifications: true,
      enableNotificationSound: false,
      notificationSound: 'none',
      notificationDuration: 7000,
      emailNotifications: true,
      pushNotifications: false,
      language: 'en',
      itemsPerPage: 12,
      showProfilePicture: true,
      showEmailInProfile: false,
      autoJoinClubs: false,
      showVoteProgress: true,
      showCompletionProgress: true
    }
  },
  {
    email: 'sophia.chen@consensus.dev',
    name: 'Sophia Chen',
    role: 'member',
    picture: 'https://via.placeholder.com/150/ffc107/000000?text=SC',
    settings: {
      theme: 'dark',
      showOnlineStatus: false,
      enableNotifications: true,
      enableNotificationSound: true,
      notificationSound: 'bell',
      notificationDuration: 4000,
      emailNotifications: false,
      pushNotifications: true,
      language: 'en',
      itemsPerPage: 12,
      showProfilePicture: true,
      showEmailInProfile: true,
      autoJoinClubs: true,
      showVoteProgress: true,
      showCompletionProgress: true
    }
  },
  {
    email: 'michael.johnson@consensus.dev',
    name: 'Michael Johnson',
    role: 'member',
    picture: 'https://via.placeholder.com/150/6f42c1/ffffff?text=MJ',
    settings: {
      theme: 'light',
      showOnlineStatus: true,
      enableNotifications: false,
      enableNotificationSound: false,
      notificationSound: 'none',
      notificationDuration: 5000,
      emailNotifications: false,
      pushNotifications: false,
      language: 'en',
      itemsPerPage: 12,
      showProfilePicture: false,
      showEmailInProfile: true,
      autoJoinClubs: false,
      showVoteProgress: true,
      showCompletionProgress: true
    }
  },
  {
    email: 'emma.williams@consensus.dev',
    name: 'Emma Williams',
    role: 'member',
    picture: 'https://via.placeholder.com/150/20c997/ffffff?text=EW',
    settings: {
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
    }
  },
  {
    email: 'oliver.brown@consensus.dev',
    name: 'Oliver Brown',
    role: 'member',
    picture: 'https://via.placeholder.com/150/fd7e14/ffffff?text=OB',
    settings: {
      theme: 'dark',
      showOnlineStatus: true,
      enableNotifications: true,
      enableNotificationSound: true,
      notificationSound: 'chime',
      notificationDuration: 6000,
      emailNotifications: true,
      pushNotifications: true,
      language: 'en',
      itemsPerPage: 12,
      showProfilePicture: true,
      showEmailInProfile: true,
      autoJoinClubs: false,
      showVoteProgress: true,
      showCompletionProgress: true
    }
  },
  {
    email: 'ava.davis@consensus.dev',
    name: 'Ava Davis',
    role: 'member',
    picture: 'https://via.placeholder.com/150/e83e8c/ffffff?text=AD',
    settings: {
      theme: 'light',
      showOnlineStatus: true,
      enableNotifications: true,
      enableNotificationSound: true,
      notificationSound: 'bell',
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
    }
  },
  {
    email: 'liam.miller@consensus.dev',
    name: 'Liam Miller',
    role: 'member',
    picture: 'https://via.placeholder.com/150/17a2b8/ffffff?text=LM',
    settings: {
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
    }
  }
];

export async function populateTestUsers() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established');

    const userRepository = AppDataSource.getRepository(User);
    const userSettingsRepository = AppDataSource.getRepository(UserSettings);

    // Skip clearing for now due to foreign key constraints
    console.log('📝 Populating test users (skipping clear due to FK constraints)');

    for (const userData of testUsers) {
      try {
        // Check if user already exists
        const existingUser = await userRepository.findOne({ where: { email: userData.email } });
        if (existingUser) {
          console.log(`⏭️  User already exists: ${userData.name} (${userData.email})`);
          continue;
        }

        // Create user
        const user = userRepository.create({
          email: userData.email,
          name: userData.name,
          role: userData.role,
          picture: userData.picture,
          isActive: true,
          emailVerified: true,
          timezone: 'UTC',
          locale: 'en'
        });

        const savedUser = await userRepository.save(user);
        console.log(`✅ Created user: ${savedUser.name} (${savedUser.email})`);

        // Create user settings
        const settings = userSettingsRepository.create({
          userId: savedUser.id,
          ...userData.settings
        });

        await userSettingsRepository.save(settings);
        console.log(`✅ Created settings for: ${savedUser.name}`);
      } catch (error) {
        console.error(`❌ Error creating user ${userData.name}:`, error);
      }
    }

    console.log('🎉 Successfully populated database with test users!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error populating test users:', error);
    process.exit(1);
  }
}

populateTestUsers();
