import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

// Load environment variables from .env file
dotenv.config();

// Create a MySQL connection pool
export const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true, // Convert string to boolean
    connectionLimit: 10,
    queueLimit: 0
});