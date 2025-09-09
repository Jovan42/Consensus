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
import { Appeal } from '../entities/Appeal';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: true, // Auto-create tables based on entities
  logging: process.env.NODE_ENV === 'development',
  entities: [Club, Member, Round, Recommendation, Vote, Completion, MemberNote, Notification, User, UserSettings, Appeal],
  migrations: [process.env.NODE_ENV === 'production' ? 'dist/migrations/*.js' : 'src/migrations/*.ts'],
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
    console.log('📊 Database URL:', process.env.DATABASE_URL ? 'configured' : 'missing');
    
    // Add timeout to prevent hanging
    const connectionPromise = AppDataSource.initialize();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database connection timeout after 30 seconds')), 30000)
    );
    
    await Promise.race([connectionPromise, timeoutPromise]);
    console.log('✅ Database connection established');
    
    // Skip migrations since we're using synchronize: true
    console.log('ℹ️  Using synchronize: true - tables will be auto-created from entities');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    if (process.env.NODE_ENV === 'production') {
      console.log('🚨 Production deployment failed - check database configuration');
      throw error; // Fail fast in production
    }
    console.log('⚠️  Continuing without database connection for development');
  }
};
