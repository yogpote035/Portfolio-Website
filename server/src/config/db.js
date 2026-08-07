import mysql from 'mysql2/promise';
import { env } from './env.js';

export const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  ssl: env.db.ssl
    ? {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: true,
    }
    : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  namedPlaceholders: true,
});

export async function testDatabaseConnection() {
  const connection = await pool.getConnection();
  try {
    await connection.ping().then(() => {
      console.log('Database connection successful.');
    });
  } finally {
    connection.release();
  }
}
