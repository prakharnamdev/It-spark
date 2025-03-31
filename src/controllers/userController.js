const { validationResult } = require('express-validator');
const UserModel = require('../models/userModel');
const { generateToken } = require('../utils/jwtUtils');

// User controller for handling user-related operations
const UserController = {
    register: async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array().map(err => ({
                        field: err.param,
                        message: err.msg
                    }))
                });
            }

            const { username, password } = req.body;

            const existingUser = await UserModel.findByUsername(username);
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'The username is already taken. Please choose a different one.'
                });
            }

            const newUser = await UserModel.create({ username, password });

            const token = generateToken(newUser.id);

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    user: newUser,
                    token
                }
            });
        } catch (error) {
            console.log(error, 'error')
            next(error);
        }
    },

    login: async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { username, password } = req.body;

            const user = await UserModel.findByUsername(username);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            const isPasswordValid = await UserModel.validatePassword(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            const token = generateToken(user.id);

            res.status(200).json({
                success: true,
                data: {
                    token,
                    user: {
                        id: user.id,
                        username: user.username
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    },

    getProfile: async (req, res, next) => {
        try {
            const userId = req.user.id;

            const user = await UserModel.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.status(200).json({
                success: true,
                data: user
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = UserController;