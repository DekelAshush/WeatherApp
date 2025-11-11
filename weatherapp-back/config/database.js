import db from './knex.js';

// Verify connection and create weather_history table if it doesn't exist
const initializeDatabase = async () => {
  try {
    // Test connection
    await db.raw('SELECT 1');
    
    // Check if table exists
    const tableExists = await db.schema.hasTable('weather_history');
    
    if (!tableExists) {
      // Create weather_history table
      await db.schema.createTable('weather_history', (table) => {
        table.increments('id').primary();
        table.string('location_name', 100).notNullable();
        table.string('location_type', 20).notNullable();
        table.decimal('lat', 10, 7);
        table.decimal('lon', 10, 7);
        table.date('start_date').notNullable();
        table.date('end_date');
        table.decimal('avg_temp', 5, 2);
        table.decimal('humidity', 5, 2);
        table.decimal('wind_speed', 5, 2);
        table.text('description');
        table.timestamp('created_at').defaultTo(db.fn.now());
      });
    }
    
    console.log('✅ weather_history ready');
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    throw error;
  }
};

export { db, initializeDatabase };

