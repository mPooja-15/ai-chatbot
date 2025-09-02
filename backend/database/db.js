const mongoose = require('mongoose');
const { logger, logUtils } = require('../utils/logger');

let connectionStatus = 'disconnected';
let retryCount = 0;
const maxRetries = 5;
const retryDelay = 5000; // 5 seconds

// Database connection options
const dbOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10, // Maximum number of connections in the pool
  minPoolSize: 2,  // Minimum number of connections in the pool
  serverSelectionTimeoutMS: 5000, // Timeout for server selection
  socketTimeoutMS: 45000, // Socket timeout
  bufferCommands: false, // Disable mongoose buffering
  autoIndex: process.env.NODE_ENV !== 'production', // Build indexes in development
  retryWrites: true, // Retry write operations
  w: 'majority', // Write concern
  readPreference: 'primaryPreferred', // Read preference
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
  heartbeatFrequencyMS: 10000, // Heartbeat frequency
};

// Connection event handlers
const setupConnectionHandlers = () => {
  mongoose.connection.on('connected', () => {
    connectionStatus = 'connected';
    retryCount = 0;
    logger.info('MongoDB connected successfully');
    logUtils.logDatabase('connect', 'mongodb', 0, true);
  });

  mongoose.connection.on('error', (err) => {
    connectionStatus = 'error';
    logger.error('MongoDB connection error:', err);
    logUtils.logDatabase('connect', 'mongodb', 0, false);
  });

  mongoose.connection.on('disconnected', () => {
    connectionStatus = 'disconnected';
    logger.warn('MongoDB disconnected');
    logUtils.logDatabase('disconnect', 'mongodb', 0, true);
  });

  mongoose.connection.on('reconnected', () => {
    connectionStatus = 'connected';
    logger.info('MongoDB reconnected');
    logUtils.logDatabase('reconnect', 'mongodb', 0, true);
  });

  mongoose.connection.on('close', () => {
    connectionStatus = 'closed';
    logger.info('MongoDB connection closed');
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    try {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    } catch (err) {
      logger.error('Error during graceful shutdown:', err);
      process.exit(1);
    }
  });
};

// Connect to database with retry logic
const connectDB = async () => {
  try {
    const startTime = Date.now();
    
    if (mongoose.connection.readyState === 1) {
      logger.info('MongoDB already connected');
      return;
    }

    logger.info('Connecting to MongoDB...');
    
    await mongoose.connect(process.env.MONGODB_URI, dbOptions);
    
    const duration = Date.now() - startTime;
    logUtils.logDatabase('connect', 'mongodb', duration, true);
    
  } catch (error) {
    const duration = Date.now() - Date.now();
    logUtils.logDatabase('connect', 'mongodb', duration, false);
    
    logger.error('MongoDB connection failed:', error);
    
    if (retryCount < maxRetries) {
      retryCount++;
      logger.info(`Retrying connection (${retryCount}/${maxRetries}) in ${retryDelay/1000} seconds...`);
      
      setTimeout(() => {
        connectDB();
      }, retryDelay);
    } else {
      logger.error('Max retry attempts reached. Exiting...');
      process.exit(1);
    }
  }
};

// Get connection status
const getConnectionStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  return {
    status: states[mongoose.connection.readyState] || 'unknown',
    readyState: mongoose.connection.readyState,
    connectionStatus
  };
};

// Health check
const healthCheck = async () => {
  try {
    const startTime = Date.now();
    
    // Ping the database
    await mongoose.connection.db.admin().ping();
    
    const duration = Date.now() - startTime;
    
    return {
      status: 'healthy',
      responseTime: `${duration}ms`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error('Database health check failed:', error);
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Get database statistics
const getDatabaseStats = async () => {
  try {
    const stats = await mongoose.connection.db.stats();
    return {
      collections: stats.collections,
      dataSize: `${(stats.dataSize / 1024 / 1024).toFixed(2)}MB`,
      storageSize: `${(stats.storageSize / 1024 / 1024).toFixed(2)}MB`,
      indexes: stats.indexes,
      indexSize: `${(stats.indexSize / 1024 / 1024).toFixed(2)}MB`
    };
  } catch (error) {
    logger.error('Failed to get database stats:', error);
    return { error: error.message };
  }
};

// Monitor database performance
const monitorPerformance = () => {
  const startTime = Date.now();
  
  return {
    start: () => startTime,
    end: () => Date.now() - startTime,
    log: (operation, collection, success = true) => {
      const duration = Date.now() - startTime;
      logUtils.logDatabase(operation, collection, duration, success);
    }
  };
};

// Connection pool management
const getConnectionPoolStatus = () => {
  const pool = mongoose.connection.pool;
  if (pool) {
    return {
      totalCount: pool.totalCount,
      availableCount: pool.availableCount,
      pendingCount: pool.pendingCount,
      maxPoolSize: pool.options.maxPoolSize
    };
  }
  return null;
};

module.exports = {
  connectDB,
  getConnectionStatus,
  healthCheck,
  getDatabaseStats,
  monitorPerformance,
  getConnectionPoolStatus,
  setupConnectionHandlers
};

