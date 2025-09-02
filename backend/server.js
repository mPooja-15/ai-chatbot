const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const { connectDB, getConnectionStatus, healthCheck, setupConnectionHandlers } = require('./database/db');
const { logger, stream, logUtils } = require('./utils/logger');
const { cacheMiddleware } = require('./utils/cache');

const authRoutes = require('./router/auth');
const chatRoutes = require('./router/chat');
const userRoutes = require('./router/user');

const { errorHandler } = require('./utils/errorHandler');
const { authenticateToken } = require('./utils/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// Compression middleware
app.use(compression());

// Enhanced logging middleware
app.use(morgan('combined', { stream }));

// Request logging with performance monitoring
app.use(logUtils.logRequest);

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:4173', 
      'http://127.0.0.1:4173' 
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      logger.warn('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Length', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

// Rate limiting with enhanced logging
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.',
  handler: (req, res) => {
    logUtils.logRateLimit(req.ip, req.originalUrl, req.rateLimit);
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(process.env.RATE_LIMIT_WINDOW_MS / 1000)
    });
  },
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/api/health';
  }
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
connectDB();
setupConnectionHandlers();

// CORS preflight
app.options('*', cors());

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const startTime = Date.now();
    
    const dbStatus = getConnectionStatus();
    const dbHealth = await healthCheck();
    
    const responseTime = Date.now() - startTime;

    res.status(200).json({
      status: 'OK',
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      database: {
        connection: dbStatus,
        health: dbHealth
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Health check failed',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// API routes with caching for read operations
app.use('/api/auth', authRoutes);
app.use('/api/chat', authenticateToken, chatRoutes);
app.use('/api/user', authenticateToken, userRoutes);

// Cached routes for better performance
app.get('/api/chat', authenticateToken, cacheMiddleware(300), chatRoutes);
app.get('/api/user/profile', authenticateToken, cacheMiddleware(600), userRoutes);

// 404 handler
app.use('*', (req, res) => {
  logger.warn('Route not found:', { url: req.originalUrl, method: req.method, ip: req.ip });
  res.status(404).json({ 
    success: false,
    message: 'Route not found',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  logger.info(`CORS enabled for: http://localhost:5173, http://localhost:3000`);
  
  // Log startup information
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔒 Security: Helmet, CORS, Rate Limiting enabled`);
  console.log(`📊 Logging: Winston logger configured`);
  console.log(`💾 Database: MongoDB connection established`);
});