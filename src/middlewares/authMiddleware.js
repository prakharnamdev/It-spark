const { verifyToken } = require('../utils/jwtUtils');

const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. Please provide a valid token.'
            });
        }

        const token = authHeader.split(' ')[1];

        const decoded = verifyToken(token);

        req.user = { id: decoded.id };

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

module.exports = {
    authenticate
};