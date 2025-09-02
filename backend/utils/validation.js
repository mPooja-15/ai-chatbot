const { body, param, query, validationResult } = require('express-validator');
const sanitizeHtml = require('sanitize-html');

// Common validation rules
const commonValidations = {
  // User input sanitization
  sanitizeInput: (input) => {
    if (typeof input === 'string') {
      return sanitizeHtml(input, {
        allowedTags: [],
        allowedAttributes: {}
      });
    }
    return input;
  },

  // Sanitize request body
  sanitizeBody: (req, res, next) => {
    if (req.body) {
      Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
          req.body[key] = commonValidations.sanitizeInput(req.body[key]);
        }
      });
    }
    next();
  },

  // Enhanced validation result handler
  handleValidationErrors: (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value,
        location: error.location
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: formattedErrors,
        timestamp: new Date().toISOString()
      });
    }
    next();
  }
};

// Auth validation rules
const authValidationRules = {
  register: [
    body('username')
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    
    body('firstName')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('First name must be between 1 and 50 characters'),
    
    body('lastName')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Last name must be between 1 and 50 characters')
  ],

  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ]
};

// Chat validation rules
const chatValidationRules = {
  createChat: [
    body('title')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Chat title must be less than 100 characters')
  ],

  sendMessage: [
    body('message')
      .trim()
      .notEmpty()
      .withMessage('Message cannot be empty')
      .isLength({ max: 5000 })
      .withMessage('Message must be less than 5000 characters'),
    
    body('files')
      .optional()
      .isArray()
      .withMessage('Files must be an array')
  ],

  getChats: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    
    query('search')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Search term must be less than 100 characters')
  ]
};

// File validation rules
const fileValidationRules = {
  uploadFile: [
    body('chatId')
      .isMongoId()
      .withMessage('Invalid chat ID'),
    
    body('fileType')
      .optional()
      .isIn(['pdf', 'csv'])
      .withMessage('File type must be PDF or CSV')
  ]
};

// User validation rules
const userValidationRules = {
  updateProfile: [
    body('firstName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('First name must be between 1 and 50 characters'),
    
    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Last name must be between 1 and 50 characters'),
    
    body('username')
      .optional()
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores')
  ]
};

module.exports = {
  commonValidations,
  authValidationRules,
  chatValidationRules,
  fileValidationRules,
  userValidationRules
};
