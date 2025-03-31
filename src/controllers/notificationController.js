const { validationResult } = require('express-validator');
const NotificationModel = require('../models/notificationModel');
const UserModel = require('../models/userModel');
const socketService = require('../services/socketService');

const NotificationController = {
    sendNotification: async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { senderId, receiverId, message } = req.body;

            const sender = await UserModel.findById(senderId);
            if (!sender) {
                return res.status(404).json({
                    success: false,
                    message: 'Sender not found'
                });
            }

            const receiver = await UserModel.findById(receiverId);
            if (!receiver) {
                return res.status(404).json({
                    success: false,
                    message: 'Receiver not found'
                });
            }

            const notification = await NotificationModel.create({
                senderId,
                receiverId,
                message
            });

            notification.sender = {
                id: sender.id,
                username: sender.username
            };

            socketService.sendNotification(receiverId, {
                ...notification,
                sender: {
                    id: sender.id,
                    username: sender.username
                }
            });

            res.status(201).json({
                success: true,
                data: notification
            });
        } catch (error) {
            next(error);
        }
    },

    getNotifications: async (req, res, next) => {
        try {
            const userId = req.user.id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            const result = await NotificationModel.getByReceiverId(userId, page, limit);

            res.status(200).json({
                success: true,
                data: result.notifications,
                pagination: result.pagination
            });
        } catch (error) {
            next(error);
        }
    },

    markAsRead: async (req, res, next) => {
        try {
            const userId = req.user.id;
            const notificationId = req.params.id;

            const notification = await NotificationModel.findById(notificationId, userId);
            if (!notification) {
                return res.status(404).json({
                    success: false,
                    message: 'Notification not found'
                });
            }

            const updatedNotification = await NotificationModel.markAsRead(notificationId, userId);

            res.status(200).json({
                success: true,
                data: updatedNotification
            });
        } catch (error) {
            next(error);
        }
    },

    markAllAsRead: async (req, res, next) => {
        try {
            const userId = req.user.id;

            const updatedCount = await NotificationModel.markAllAsRead(userId);

            res.status(200).json({
                success: true,
                message: `${updatedCount} notifications marked as read`,
                data: { updatedCount }
            });
        } catch (error) {
            next(error);
        }
    },

    getUnreadCount: async (req, res, next) => {
        try {
            const userId = req.user.id;

            const count = await NotificationModel.countUnread(userId);

            res.status(200).json({
                success: true,
                data: { count }
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = NotificationController;