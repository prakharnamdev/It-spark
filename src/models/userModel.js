const db = require('../config/database');
const bcrypt = require('bcrypt');

const UserModel = {
    findByUsername: async (username) => {
        const query = 'SELECT * FROM users WHERE username = $1';
        const { rows } = await db.query(query, [username]);
        return rows[0];
    },

    findById: async (id) => {
        const query = 'SELECT id, username, created_at FROM users WHERE id = $1';
        const { rows } = await db.query(query, [id]);
        return rows[0];
    },

    create: async (userData) => {
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        const query = 'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username, created_at';
        const values = [userData.username, hashedPassword];

        const { rows } = await db.query(query, values);
        return rows[0];
    },

    // Validate user password
    validatePassword: async (plainPassword, hashedPassword) => {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }
};

module.exports = UserModel;