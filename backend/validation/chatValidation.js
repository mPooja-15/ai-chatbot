const { body } = require('express-validator');


const createChatValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Chat title cannot exceed 100 characters')
];


const sendMessageValidation = [
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message content is required')
    .isLength({ max: 5000 })
    .withMessage('Message cannot exceed 5000 characters'),
  
  body('files')
    .optional()
    .isArray()
    .withMessage('Files must be an array'),
  
  body('files.*.fileId')
    .optional()
    .isMongoId()
    .withMessage('Invalid file ID format')
];


const updateSettingsValidation = [
  body('model')
    .optional()
    .isIn(['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'])
    .withMessage('Invalid model selection'),
  
  body('temperature')
    .optional()
    .isFloat({ min: 0, max: 2 })
    .withMessage('Temperature must be between 0 and 2'),
  
  body('maxTokens')
    .optional()
    .isInt({ min: 100, max: 4000 })
    .withMessage('Max tokens must be between 100 and 4000')
];

const fileUploadValidation = [
  body('chatId')
    .isMongoId()
    .withMessage('Invalid chat ID format')
];

module.exports = {
  createChatValidation,
  sendMessageValidation,
  updateSettingsValidation,
  fileUploadValidation
};
