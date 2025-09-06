import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: process.env.NODE_ENV === 'development', // Only in development
  logging: process.env.NODE_ENV === 'development',
  entities: ['src/entities/*.ts'],
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts'],
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
