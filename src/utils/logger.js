/**
 * logger.js — Logger centralizado com Winston
 */

const { createLogger, format, transports } = require('winston');
const { combine, timestamp, colorize, printf, errors } = format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    colorize(),
    timestamp({ format: 'DD/MM/YYYY HH:mm:ss' }),
    errors({ stack: true }),
    logFormat
  ),
  transports: [
    new transports.Console(),
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: combine(
        timestamp({ format: 'DD/MM/YYYY HH:mm:ss' }),
        errors({ stack: true }),
        logFormat
      ),
    }),
    new transports.File({
      filename: 'logs/combined.log',
      format: combine(
        timestamp({ format: 'DD/MM/YYYY HH:mm:ss' }),
        logFormat
      ),
    }),
  ],
});

module.exports = logger;
