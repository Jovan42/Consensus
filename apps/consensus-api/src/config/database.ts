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

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: process.env.NODE_ENV === 'development', // Only in development
  logging: process.env.NODE_ENV === 'development',
  entities: [Club, Member, Round, Recommendation, Vote, Completion, MemberNote, Notification],
  migrations: [],
  subscribers: [],
});

export const initializeDatabase = async () => {
  try {
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('username')) {
      console.log('⚠️  Database URL not configured, skipping database connection');
      console.log('   To connect to database, update DATABASE_URL in .env file');
      return;
    }
    
    await AppDataSource.initialize();
    console.log('✅ Database connection established');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.log('⚠️  Continuing without database connection for development');
  }
};
