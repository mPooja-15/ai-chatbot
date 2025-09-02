const { body, query, param } = require('express-validator');

const updatePreferencesValidation = [
  body('theme')
    .optional()
    .isIn(['light', 'dark'])
    .withMessage('Theme must be either light or dark'),
  
  body('language')
    .optional()
    .isLength({ min: 2, max: 5 })
    .withMessage('Language code must be between 2 and 5 characters')
];

const getUserFilesValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('fileType')
    .optional()
    .isIn(['pdf', 'csv', 'other', 'all'])
    .withMessage('Invalid file type filter'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term cannot exceed 100 characters')
];

const deleteUserFileValidation = [
  param('fileId')
    .isMongoId()
    .withMessage('Invalid file ID format')
];

const exportUserDataValidation = [
  query('format')
    .optional()
    .isIn(['json', 'csv'])
    .withMessage('Export format must be either json or csv')
];

const deactivateAccountValidation = [
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters'),
  
  body('confirmPassword')
    .notEmpty()
    .withMessage('Password confirmation is required for account deactivation')
];

module.exports = {
  updatePreferencesValidation,
  getUserFilesValidation,
  deleteUserFileValidation,
  exportUserDataValidation,
  deactivateAccountValidation
};
