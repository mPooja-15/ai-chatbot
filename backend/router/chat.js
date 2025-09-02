const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const chatController = require('../controller/chatController');
const {
  createChatValidation,
  sendMessageValidation,
  updateSettingsValidation
} = require('../validation/chatValidation');

const router = express.Router();

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'text/csv'];
  const allowedExtensions = ['.pdf', '.csv'];
  
  const isValidMimeType = allowedTypes.includes(file.mimetype);
  const isValidExtension = allowedExtensions.some(ext => 
    file.originalname.toLowerCase().endsWith(ext)
  );
  
  if (isValidMimeType || isValidExtension) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and CSV files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024,
    files: 5 
  }
});

router.post('/', createChatValidation, chatController.createChat);
router.get('/', chatController.getUserChats);
router.get('/:chatId', chatController.getChatById);
router.get('/:chatId/history', chatController.getChatHistory);
router.post('/:chatId/message', sendMessageValidation, chatController.sendMessage);
router.post('/:chatId/upload', upload.single('file'), chatController.uploadFile);
router.put('/:chatId/settings', updateSettingsValidation, chatController.updateChatSettings);
router.delete('/:chatId', chatController.deleteChat);

module.exports = router;
