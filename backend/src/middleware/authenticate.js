import jwt from 'jsonwebtoken';
import config from '../config/jwt-config.js';
import AuthService from '../services/auth/AuthService.js';

const authService = new AuthService();

/**
 * Token認証チェック
 */
const authenticate = function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.slice(7); // "Bearer xxx" → "xxx"
    const decoded = authService.checkToken(token);
    req.jwtPayload = decoded;
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    return res.status(401).json({
      message: 'Not authenticated',
    });
  }
};

export default authenticate;
