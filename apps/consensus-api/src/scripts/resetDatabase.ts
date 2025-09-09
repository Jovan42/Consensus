import { AppDataSource } from '../config/database';

async function resetDatabase() {
  try {
    console.log('🔄 Connecting to database...');
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    // Clear the migrations table to allow re-running migrations
    console.log('🔄 Clearing migrations table...');
    await AppDataSource.query('DELETE FROM migrations');
    console.log('✅ Migrations table cleared');

    console.log('✅ Database reset completed - you can now run migrations again');
  } catch (error) {
    console.error('❌ Error resetting database:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

resetDatabase();
