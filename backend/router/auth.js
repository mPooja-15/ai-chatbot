const express = require('express');
const authController = require('../controller/authController');
const { authenticateToken } = require('../utils/auth');
const {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation
} = require('../validation/authValidation');

const router = express.Router();

router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.get('/me', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, updateProfileValidation, authController.updateProfile);
router.put('/change-password', authenticateToken, changePasswordValidation, authController.changePassword);
router.post('/logout', authenticateToken, authController.logout);

module.exports = router;
