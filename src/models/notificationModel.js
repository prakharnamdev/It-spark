const db = require('../config/database');

const NotificationModel = {
    create: async (notificationData) => {
        const query = `
      INSERT INTO notifications (sender_id, receiver_id, message)
      VALUES ($1, $2, $3)
      RETURNING id, sender_id, receiver_id, message, is_read, created_at
    `;
        const values = [
            notificationData.senderId,
            notificationData.receiverId,
            notificationData.message
        ];

        const { rows } = await db.query(query, values);
        return rows[0];
    },

    getByReceiverId: async (receiverId, page = 1, limit = 10) => {
        const offset = (page - 1) * limit;

        const query = `
      SELECT n.id, n.message, n.is_read, n.created_at,
             u.id as sender_id, u.username as sender_username
      FROM notifications n
      JOIN users u ON n.sender_id = u.id
      WHERE n.receiver_id = $1
      ORDER BY n.created_at DESC
      LIMIT $2 OFFSET $3
    `;

        const countQuery = 'SELECT COUNT(*) FROM notifications WHERE receiver_id = $1';

        const [notifications, countResult] = await Promise.all([
            db.query(query, [receiverId, limit, offset]),
            db.query(countQuery, [receiverId])
        ]);

        const totalCount = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalCount / limit);

        return {
            notifications: notifications.rows,
            pagination: {
                total: totalCount,
                page,
                limit,
                totalPages
            }
        };
    },

    markAsRead: async (notificationId, userId) => {
        const query = `
      UPDATE notifications
      SET is_read = TRUE
      WHERE id = $1 AND receiver_id = $2
      RETURNING id, sender_id, receiver_id, message, is_read, created_at
    `;

        const { rows } = await db.query(query, [notificationId, userId]);
        return rows[0];
    },

    markAllAsRead: async (userId) => {
        const query = `
      UPDATE notifications
      SET is_read = TRUE
      WHERE receiver_id = $1 AND is_read = FALSE
      RETURNING id
    `;

        const { rows } = await db.query(query, [userId]);
        return rows.length;
    },

    findById: async (notificationId, userId) => {
        const query = `
      SELECT * FROM notifications
      WHERE id = $1 AND receiver_id = $2
    `;

        const { rows } = await db.query(query, [notificationId, userId]);
        return rows[0];
    },

    countUnread: async (userId) => {
        const query = 'SELECT COUNT(*) FROM notifications WHERE receiver_id = $1 AND is_read = FALSE';
        const { rows } = await db.query(query, [userId]);
        return parseInt(rows[0].count);
    }
};

module.exports = NotificationModel;