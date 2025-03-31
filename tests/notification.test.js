const request = require('supertest');
const { app, server } = require('../src/app');
const db = require('../src/config/database');

describe('Notification API', () => {
    const testUsers = {
        sender: {
            username: `sender_${Date.now()}`,
            password: 'password123'
        },
        receiver: {
            username: `receiver_${Date.now()}`,
            password: 'password123'
        }
    };

    let senderToken, receiverToken;
    let senderId, receiverId;
    let notificationId;

    beforeAll(async () => {
        const senderRes = await request(app)
            .post('/users/register')
            .send(testUsers.sender);

        senderToken = senderRes.body.data.token;
        senderId = senderRes.body.data.user.id;

        const receiverRes = await request(app)
            .post('/users/register')
            .send(testUsers.receiver);

        receiverToken = receiverRes.body.data.token;
        receiverId = receiverRes.body.data.user.id;
    });

    afterAll(async () => {
        await db.query('DELETE FROM users WHERE username IN ($1, $2)',
            [testUsers.sender.username, testUsers.receiver.username]);

        server.close();
    });

    describe('POST /notifications/send', () => {
        it('should send a notification', async () => {
            const notification = {
                senderId: senderId,
                receiverId: receiverId,
                message: 'Test notification message'
            };

            const res = await request(app)
                .post('/notifications/send')
                .set('Authorization', `Bearer ${senderToken}`)
                .send(notification);

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body.data).toHaveProperty('id');
            expect(res.body.data).toHaveProperty('message', notification.message);

            notificationId = res.body.data.id;
        });

        it('should fail with invalid receiver', async () => {
            const notification = {
                senderId: senderId,
                receiverId: 9999,
                message: 'Test notification message'
            };

            const res = await request(app)
                .post('/notifications/send')
                .set('Authorization', `Bearer ${senderToken}`)
                .send(notification);

            expect(res.statusCode).toEqual(404);
            expect(res.body).toHaveProperty('success', false);
        });

        it('should fail with message too long', async () => {
            const longMessage = 'A'.repeat(256);

            const notification = {
                senderId: senderId,
                receiverId: receiverId,
                message: longMessage
            };

            const res = await request(app)
                .post('/notifications/send')
                .set('Authorization', `Bearer ${senderToken}`)
                .send(notification);

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('success', false);
        });
    });

    describe('GET /notifications', () => {
        it('should get user notifications', async () => {
            const res = await request(app)
                .get('/notifications')
                .set('Authorization', `Bearer ${receiverToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body).toHaveProperty('data');
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBeGreaterThan(0);
        });

        it('should support pagination', async () => {
            const res = await request(app)
                .get('/notifications?page=1&limit=5')
                .set('Authorization', `Bearer ${receiverToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('pagination');
            expect(res.body.pagination).toHaveProperty('page', 1);
            expect(res.body.pagination).toHaveProperty('limit', 5);
        });
    });

    describe('PUT /notifications/:id/read', () => {
        it('should mark notification as read', async () => {
            const res = await request(app)
                .put(`/notifications/${notificationId}/read`)
                .set('Authorization', `Bearer ${receiverToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body.data).toHaveProperty('is_read', true);
        });

        it('should fail with non-existent notification', async () => {
            const res = await request(app)
                .put('/notifications/9999/read')
                .set('Authorization', `Bearer ${receiverToken}`);

            expect(res.statusCode).toEqual(404);
            expect(res.body).toHaveProperty('success', false);
        });
    });

    describe('GET /notifications/unread-count', () => {
        it('should get unread notification count', async () => {
            const res = await request(app)
                .get('/notifications/unread-count')
                .set('Authorization', `Bearer ${receiverToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body.data).toHaveProperty('count');
            expect(typeof res.body.data.count).toBe('number');
        });
    });

    describe('PUT /notifications/read-all', () => {
        beforeAll(async () => {
            await request(app)
                .post('/notifications/send')
                .set('Authorization', `Bearer ${senderToken}`)
                .send({
                    senderId: senderId,
                    receiverId: receiverId,
                    message: 'Another test notification'
                });
        });

        it('should mark all notifications as read', async () => {
            const res = await request(app)
                .put('/notifications/read-all')
                .set('Authorization', `Bearer ${receiverToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body.data).toHaveProperty('updatedCount');
        });

        it('should show zero unread notifications after marking all as read', async () => {
            const res = await request(app)
                .get('/notifications/unread-count')
                .set('Authorization', `Bearer ${receiverToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.data).toHaveProperty('count', 0);
        });
    });
});