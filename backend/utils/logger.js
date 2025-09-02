const winston = require('winston');
const path = require('path');

// Define log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Define log colors
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

// Create custom format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Create structured format for production
const structuredFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
  levels: logLevels,
  format: process.env.NODE_ENV === 'production' ? structuredFormat : logFormat,
  transports: [
    // Console transport
    new winston.transports.Console({
      level: process.env.LOG_LEVEL || 'info',
    }),
    
    // File transport for errors
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // File transport for all logs
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Add colors to winston
winston.addColors(logColors);

// Create a stream object for Morgan HTTP logging
const stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

// Logging utility functions
const logUtils = {
  // Log API requests
  logRequest: (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const logData = {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.userId || 'anonymous'
      };
      
      if (res.statusCode >= 400) {
        logger.warn('API Request', logData);
      } else {
        logger.info('API Request', logData);
      }
    });
    
    next();
  },

  // Log errors with context
  logError: (error, req = null, context = {}) => {
    const errorLog = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      ...context
    };

    if (req) {
      errorLog.request = {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.userId || 'anonymous'
      };
    }

    logger.error('Application Error', errorLog);
  },

  // Log database operations
  logDatabase: (operation, collection, duration, success = true) => {
    const level = success ? 'info' : 'warn';
    logger[level]('Database Operation', {
      operation,
      collection,
      duration: `${duration}ms`,
      success
    });
  },

  // Log file operations
  logFileOperation: (operation, filename, size, success = true) => {
    const level = success ? 'info' : 'warn';
    logger[level]('File Operation', {
      operation,
      filename,
      size: `${(size / 1024).toFixed(2)}KB`,
      success
    });
  },

  // Log authentication events
  logAuth: (event, userId, success = true, details = {}) => {
    const level = success ? 'info' : 'warn';
    logger[level]('Authentication Event', {
      event,
      userId,
      success,
      ...details
    });
  },

  // Log rate limiting
  logRateLimit: (ip, endpoint, limit) => {
    logger.warn('Rate Limit Exceeded', {
      ip,
      endpoint,
      limit
    });
  }
};

module.exports = {
  logger,
  stream,
  logUtils
};
