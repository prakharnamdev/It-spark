const pool = require('./src/config/database');

const createTables = async () => {
  try {
    const query = `
      -- Create Users Table
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create Notifications Table
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        message VARCHAR(255) NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create index for faster notification lookup by receiver
      CREATE INDEX IF NOT EXISTS idx_notifications_receiver ON notifications(receiver_id);
    `;

    await pool.query(query);
    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    if (typeof pool.end === 'function') {
      await pool.end();
      console.log('Database connection closed.');
    }
  }
};

createTables();
