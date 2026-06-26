const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Required for Neon
    }
});

// Test connection
pool.on('connect', () => {
    console.log('✅ Connected to Neon Postgres');
});

pool.on('error', (err) => {
    console.error('❌ Neon Postgres connection error:', err);
});

// Initialize tables
async function initDatabase() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS rooms (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id BIGSERIAL PRIMARY KEY,
                room_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                user_name TEXT NOT NULL,
                avatar TEXT,
                text TEXT NOT NULL,
                time TEXT NOT NULL,
                timestamp BIGINT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
            );
        `);

        // Create default rooms if they don't exist
        const defaultRooms = [
            { id: 'general', name: 'عمومی' },
            { id: 'tech', name: 'توسعه‌دهندگان' },
            { id: 'gaming', name: 'گیمرها' },
            { id: 'fun', name: 'سرگرمی' }
        ];

        for (const room of defaultRooms) {
            await pool.query(
                `INSERT INTO rooms (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING`,
                [room.id, room.name]
            );
        }

        console.log('✅ Database tables initialized');
    } catch (err) {
        console.error('❌ Error initializing database:', err);
    }
}

// Get all messages for a room
async function getMessages(roomId, limit = 100) {
    const result = await pool.query(
        `SELECT id, room_id, user_id, user_name, avatar, text, time, timestamp 
         FROM messages 
         WHERE room_id = $1 
         ORDER BY timestamp ASC 
         LIMIT $2`,
        [roomId, limit]
    );
    return result.rows;
}

// Save a new message
async function saveMessage(message) {
    const { roomId, userId, userName, avatar, text, time, timestamp } = message;
    
    await pool.query(
        `INSERT INTO messages (room_id, user_id, user_name, avatar, text, time, timestamp) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [roomId, userId, userName, avatar, text, time, timestamp]
    );
}

// Get all rooms
async function getRooms() {
    const result = await pool.query('SELECT id, name FROM rooms ORDER BY created_at ASC');
    return result.rows;
}

// Create a new room
async function createRoom(roomId, name) {
    await pool.query(
        `INSERT INTO rooms (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING`,
        [roomId, name]
    );
}

module.exports = {
    pool,
    initDatabase,
    getMessages,
    saveMessage,
    getRooms,
    createRoom
};