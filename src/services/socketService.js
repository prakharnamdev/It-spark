const { verifyToken } = require('../utils/jwtUtils');

const SocketService = {
    io: null,
    connectedUsers: new Map(),

    init: function (io) {
        this.io = io;

        io.on('connection', (socket) => {
            console.log(`Socket connected: ${socket.id}`);

            socket.on('authenticate', (token) => {
                try {
                    const decoded = verifyToken(token);
                    const userId = decoded.id;

                    this.connectedUsers.set(userId, socket.id);
                    socket.userId = userId;

                    console.log(`User ${userId} authenticated on socket ${socket.id}`);

                    socket.join(`user:${userId}`);

                    socket.emit('authenticated', { success: true });
                } catch (error) {
                    console.error(`Socket authentication failed: ${error.message}`);
                    socket.emit('authenticated', {
                        success: false,
                        message: 'Authentication failed'
                    });
                }
            });

            socket.on('disconnect', () => {
                if (socket.userId) {
                    this.connectedUsers.delete(socket.userId);
                    console.log(`User ${socket.userId} disconnected`);
                }
                console.log(`Socket disconnected: ${socket.id}`);
            });
        });

        return io;
    },

    sendNotification: function (userId, notification) {
        if (this.io) {
            this.io.to(`user:${userId}`).emit('notification', notification);

            console.log(`Notification sent to user ${userId}`);
            return true;
        }
        return false;
    },

    isUserOnline: function (userId) {
        return this.connectedUsers.has(userId);
    }
};

module.exports = SocketService;