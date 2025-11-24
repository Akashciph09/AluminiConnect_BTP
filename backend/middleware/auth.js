const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        
        if (!authHeader) {
            return res.status(401).json({ message: 'No authentication token, access denied' });
        }

        // Extract token from Authorization header
        const token = authHeader.startsWith('Bearer ') 
            ? authHeader.substring(7) 
            : authHeader;

        const verified = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Set user data from token - include multiple keys for compatibility
        // Some routes refer to `req.user.id`, others use `req.user._id` or `req.user.userId`.
        req.user = {
            id: verified.userId,
            _id: verified.userId,
            userId: verified.userId, // For backward compatibility
            role: verified.role
        };
        
        next();
    } catch (err) {
        console.error('Auth middleware error:', err);
        res.status(401).json({ message: 'Token verification failed, authorization denied' });
    }
};

module.exports = auth; 