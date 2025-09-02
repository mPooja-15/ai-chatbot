class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    Error.captureStackTrace(this, this.constructor);
  }
}
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new AppError(message, 400);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} already exists`;
    error = new AppError(message, 400);
  }
  if (err.name === 'CastError') {
    const message = 'Invalid resource ID';
    error = new AppError(message, 400);
  }
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new AppError(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new AppError(message, 401);
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File too large';
    error = new AppError(message, 400);
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    const message = 'Too many files';
    error = new AppError(message, 400);
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Unexpected file field';
    error = new AppError(message, 400);
  }

  if (err.type === 'openai_error') {
    const message = 'AI service temporarily unavailable';
    error = new AppError(message, 503);
  }

  if (err.type === 'rate_limit') {
    const message = 'Too many requests, please try again later';
    error = new AppError(message, 429);
  }
  if (err.code === 'ENOENT') {
    const message = 'File not found';
    error = new AppError(message, 404);
  }

  if (err.code === 'EACCES') {
    const message = 'Permission denied';
    error = new AppError(message, 403);
  }

  if (err.code === 'ECONNREFUSED') {
    const message = 'Service temporarily unavailable';
    error = new AppError(message, 503);
  }

  if (err.code === 'ETIMEDOUT') {
    const message = 'Request timeout';
    error = new AppError(message, 408);
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  if (process.env.NODE_ENV === 'development') {
    res.status(statusCode).json({
      success: false,
      error: {
        message,
        statusCode,
        stack: err.stack,
        details: {
          name: err.name,
          code: err.code,
          type: err.type
        }
      }
    });
  } else {
    res.status(statusCode).json({
      success: false,
      error: {
        message: statusCode === 500 ? 'Internal server error' : message,
        statusCode
      }
    });
  }
};
const notFound = (req, res, next) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

const formatValidationErrors = (errors) => {
  return errors.map(error => ({
    field: error.path,
    message: error.message,
    value: error.value
  }));
};

const handleDatabaseError = (error) => {
  console.error('Database connection error:', error);
  
  if (error.name === 'MongoNetworkError') {
    console.error('MongoDB network error - check connection string and network');
  } else if (error.name === 'MongoServerSelectionError') {
    console.error('MongoDB server selection error - check if MongoDB is running');
  } else if (error.name === 'MongoParseError') {
    console.error('MongoDB connection string parse error');
  }
  
  if (error.name === 'MongoNetworkError' || error.name === 'MongoServerSelectionError') {
    console.error('Critical database error - exiting process');
    process.exit(1);
  }
};

const handleFileProcessingError = (error, fileId) => {
  console.error(`File processing error for file ${fileId}:`, error);
  
  if (error.message.includes('PDF')) {
    console.error('PDF processing failed - check if file is corrupted');
  } else if (error.message.includes('CSV')) {
    console.error('CSV processing failed - check file format');
  }
};

const handleRateLimitError = (req, res) => {
  console.warn(`Rate limit exceeded for IP: ${req.ip}`);
  
  res.status(429).json({
    success: false,
    error: {
      message: 'Too many requests, please try again later',
      statusCode: 429,
      retryAfter: Math.ceil(process.env.RATE_LIMIT_WINDOW_MS / 1000)
    }
  });
};

module.exports = {
  AppError,
  asyncHandler,
  errorHandler,
  notFound,
  formatValidationErrors,
  handleDatabaseError,
  handleFileProcessingError,
  handleRateLimitError
};
