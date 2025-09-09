import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Club } from '../entities/Club';
import { Member } from '../entities/Member';
import { Round } from '../entities/Round';
import { Recommendation } from '../entities/Recommendation';
import { Vote } from '../entities/Vote';
import { Completion } from '../entities/Completion';
import { MemberNote } from '../entities/MemberNote';
import { Notification } from '../entities/Notification';
import { User } from '../entities/User';
import { UserSettings } from '../entities/UserSettings';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: false, // Never use synchronize in production, use migrations instead
  logging: process.env.NODE_ENV === 'development',
  entities: [Club, Member, Round, Recommendation, Vote, Completion, MemberNote, Notification, User, UserSettings],
  migrations: ['src/migrations/*.ts'],
  subscribers: [],
});

export const initializeDatabase = async () => {
  try {
    if (!process.env.DATABASE_URL) {
      console.log('⚠️  DATABASE_URL not configured');
      if (process.env.NODE_ENV === 'production') {
        throw new Error('DATABASE_URL is required in production');
      }
      console.log('   To connect to database, update DATABASE_URL in .env file');
      return;
    }
    
    console.log('🔄 Connecting to database...');
    await AppDataSource.initialize();
    console.log('✅ Database connection established');
    
    // Run migrations in production
    if (process.env.NODE_ENV === 'production') {
      console.log('🔄 Running migrations...');
      await AppDataSource.runMigrations();
      console.log('✅ Migrations completed');
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    if (process.env.NODE_ENV === 'production') {
      throw error; // Fail fast in production
    }
    console.log('⚠️  Continuing without database connection for development');
  }
};
