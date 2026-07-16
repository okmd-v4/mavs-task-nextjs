import adminConfig from '../config/admin-config.js';

/**
 * 管理者権限チェック
 * authenticateミドルウェアの後段で使用し、req.jwtPayload.emailが
 * 管理者アカウントと一致する場合のみ次の処理へ進める
 */
const requireAdmin = function requireAdmin(req, res, next) {
  if (req.jwtPayload?.email !== adminConfig.adminEmail) {
    return res.status(403).json({ success: false, data: null, message: 'Forbidden' });
  }
  next();
};

export default requireAdmin;
