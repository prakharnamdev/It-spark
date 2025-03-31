const express = require('express');
const { body, param, query } = require('express-validator');
const NotificationController = require('../controllers/notificationController');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticate);

router.post(
    '/send',
    [
        body('senderId').isInt(),
        body('receiverId').isInt(),
        body('message').isString().trim().isLength({ min: 1, max: 255 })
    ],
    NotificationController.sendNotification
);

router.get(
    '/',
    [
        query('page').optional().isInt({ min: 1 }),
        query('limit').optional().isInt({ min: 1, max: 100 })
    ],
    NotificationController.getNotifications
);

router.put(
    '/:id/read',
    [
        param('id').isInt()
    ],
    NotificationController.markAsRead
);

router.put('/read-all', NotificationController.markAllAsRead);

router.get('/unread-count', NotificationController.getUnreadCount);

module.exports = router;