/** Server startup for BizTime. */

const app = require("./app");
require('dotenv').config();
const winston = require('winston');

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

// Set the port from environment variables or default to 3000
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server started and listening on port ${PORT}`);
});

// Gracefully handle unexpected errors
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason.stack || reason);
  process.exit(1);
});
