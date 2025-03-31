const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    port: process.env.PGPORT
});

pool.connect()
    .then(client => {
        console.log('Connected to PostgreSQL database');
        client.release();
        return client;
    })
    .catch(err => {
        console.error('Database connection error:', err.message);
    });

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool: pool,
    connect: () => {
        return pool.connect()
            .then(client => {
                console.log('Connected to PostgreSQL database');
                return client;
            })
            .catch(err => {
                console.error('Database connection error:', err.message);
                throw err;
            });
    },
    close: () => pool.end()
};