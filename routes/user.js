const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// @route   POST api/users/register-user
// @desc    Register new user
// @access  public
router.post(
    '/register-user',
    [
        check('username', 'Username is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
    ],
    userController.registerUser
);

// @route   PUT api/users/change-password
// @desc    Change password
// @access  private
router.put(
    '/change-password',
    [
      auth,
      [
        check('currentPassword', 'Current password is required').exists(),
        check('newPassword', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
      ]
    ],
    userController.changePassword
  );

// @route   POST api/users/reset-password-request
// @desc    Request password reset
// @access  Public
router.post(
    '/reset-password-request',
    [
        check('email', 'Please include a valid email').isEmail(),
    ],
    userController.requestPasswordReset
);

// @route   PUT api/users/reset-password/:resetToken
// @desc    Reset password
// @access  Public
router.put(
    '/reset-password/:resetToken',
    [
        check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
    ],
    userController.resetPassword
);

module.exports = router;