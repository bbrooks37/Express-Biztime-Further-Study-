/** Database setup for BizTime. */

const { Pool } = require('pg');
const winston = require('winston');
require('dotenv').config();

// Configure logging with Winston
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Determine the database URI based on the environment
let DB_URI;
switch (process.env.NODE_ENV) {
  case 'production':
    DB_URI = process.env.DATABASE_URL;
    break;
  case 'test':
    DB_URI = process.env.DATABASE_URL || 'postgresql:///biztime_test';
    break;
  default:
    DB_URI = process.env.DATABASE_URL || 'postgresql:///biztime';
}

// Configure the connection pool
const pool = new Pool({
  connectionString: DB_URI,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Connect to the database and handle connection errors
pool.on('connect', () => {
  logger.info('Connected to the database');
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Export query method for using pool.query
module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: async () => {
    const client = await pool.connect();
    const query = client.query;
    const release = client.release;

    // Set a timeout of 5 seconds, after which we will log this client's last query
    const timeout = setTimeout(() => {
      logger.error('A client has been checked out for more than 5 seconds!');
      logger.error(`The last executed query on this client was: ${client.lastQuery}`);
    }, 5000);

    // Monkey patch the query method to keep track of the last query executed
    client.query = (...args) => {
      client.lastQuery = args;
      return query.apply(client, args);
    };

    client.release = () => {
      clearTimeout(timeout);
      client.query = query;
      client.release = release;
      return release.apply(client);
    };

    return client;
  },
  end: () => pool.end()  // Ensure this function exists to close the pool connection
};
