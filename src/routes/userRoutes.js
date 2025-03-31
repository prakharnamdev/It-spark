const express = require('express');
const { body } = require('express-validator');
const UserController = require('../controllers/userController');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post(
    '/register',
    [

        body('username')
            .isString().withMessage('Username must be a string')
            .trim()
            .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters long'),
        body('password')
            .isString().withMessage('Password must be a string')
            .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    ],
    UserController.register
);

router.post(
    '/login',
    [
        body('username').isString().trim(),
        body('password').isString()
    ],
    UserController.login
);

router.get('/profile', authenticate, UserController.getProfile);

module.exports = router;