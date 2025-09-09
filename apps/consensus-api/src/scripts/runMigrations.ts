import 'reflect-metadata';
import { AppDataSource } from '../config/database';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function runMigrations() {
  try {
    console.log('🔄 Initializing database connection...');
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    console.log('🔄 Running migrations...');
    await AppDataSource.runMigrations();
    console.log('✅ Migrations completed successfully');

    // Only populate test users in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Populating test users...');
      const { populateTestUsers } = await import('./populateTestUsers');
      await populateTestUsers();
      console.log('✅ Test users populated');
    } else {
      console.log('ℹ️  Skipping test user population in production');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
    console.log('🔌 Database connection closed');
  }
}

runMigrations();
