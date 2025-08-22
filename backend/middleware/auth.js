const jwt = require('jsonwebtoken');
const { Student, Librarian } = require('../models');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user based on role
    let user;
    if (decoded.role === 'student') {
      user = await Student.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });
    } else if (decoded.role === 'librarian') {
      user = await Librarian.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });
    }

    if (!user || !user.is_active) {
      return res.status(401).json({ message: 'Invalid token or user not active' });
    }

    req.user = user;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(500).json({ message: 'Server error during authentication' });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.' 
      });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles
};

