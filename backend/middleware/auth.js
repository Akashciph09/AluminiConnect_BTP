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
        
        // Set user data from token - support both formats
        req.user = {
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