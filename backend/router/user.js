const express = require('express');
const userController = require('../controller/userController');
const {
  updatePreferencesValidation,
  getUserFilesValidation,
  deleteUserFileValidation,
  exportUserDataValidation,
  deactivateAccountValidation
} = require('../validation/userValidation');

const router = express.Router();

router.get('/stats', userController.getUserStats);
router.get('/files', getUserFilesValidation, userController.getUserFiles);
router.delete('/files/:fileId', deleteUserFileValidation, userController.deleteUserFile);
router.put('/preferences', updatePreferencesValidation, userController.updateUserPreferences);
router.put('/deactivate', deactivateAccountValidation, userController.deactivateAccount);
router.get('/export', exportUserDataValidation, userController.exportUserData);

module.exports = router;
