const request = require('supertest');
const { app, server } = require('../src/app');
const db = require('../src/config/database');

describe('User API', () => {
    const testUser = {
        username: `test_user_${Date.now()}`,
        password: 'password123'
    };

    let authToken;

    afterAll(async () => {
        await db.query('DELETE FROM users WHERE username = $1', [testUser.username]);
        server.close();
    });

    describe('POST /users/register', () => {
        it('should register a new user', async () => {
            const res = await request(app)
                .post('/users/register')
                .send(testUser);

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body.data).toHaveProperty('user');
            expect(res.body.data).toHaveProperty('token');
            expect(res.body.data.user).toHaveProperty('username', testUser.username);
        });

        it('should fail when username already exists', async () => {
            const res = await request(app)
                .post('/users/register')
                .send(testUser);

            expect(res.statusCode).toEqual(409);
            expect(res.body).toHaveProperty('success', false);
        });

        it('should fail with invalid password', async () => {
            const res = await request(app)
                .post('/users/register')
                .send({
                    username: 'another_user',
                    password: '123'
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('success', false);
        });
    });

    describe('POST /users/login', () => {
        it('should login user and return token', async () => {
            const res = await request(app)
                .post('/users/login')
                .send(testUser);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body.data).toHaveProperty('token');
            expect(res.body.data).toHaveProperty('user');

            authToken = res.body.data.token;
        });

        it('should fail with incorrect credentials', async () => {
            const res = await request(app)
                .post('/users/login')
                .send({
                    username: testUser.username,
                    password: 'wrong_password'
                });

            expect(res.statusCode).toEqual(401);
            expect(res.body).toHaveProperty('success', false);
        });
    });

    describe('GET /users/profile', () => {
        it('should get user profile with valid token', async () => {
            const res = await request(app)
                .get('/users/profile')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body.data).toHaveProperty('username', testUser.username);
        });

        it('should fail with no token', async () => {
            const res = await request(app)
                .get('/users/profile');

            expect(res.statusCode).toEqual(401);
            expect(res.body).toHaveProperty('success', false);
        });

        it('should fail with invalid token', async () => {
            const res = await request(app)
                .get('/users/profile')
                .set('Authorization', 'Bearer invalid_token');

            expect(res.statusCode).toEqual(401);
            expect(res.body).toHaveProperty('success', false);
        });
    });
});