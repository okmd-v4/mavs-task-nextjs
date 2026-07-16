import axios from 'axios';
import jwt from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';
import { promisify } from 'util';
import config from '../../config/jwt-config.js';
import crypto from 'crypto';

// AuthServiceクラス
class AuthService {
  /**
   * パスワードをSHA-256でハッシュ化する
   * @param params
   */
  hashSha256(string) {
    const hash = crypto.createHash('sha256');
    hash.update(string);
    return hash.digest('hex');
  }

  /**
   * jwtトークン発行
   * @param params
   */
  createToken(email, id) {
    const payload = {
      id: id,
      email: email,
    };
    const token = jwt.sign(payload, config.jwt.secret, config.jwt.options);
    return token;
  }

  /**
   * jwtトークンチェック
   * @param params
   */
  checkToken(token) {
    const decoded = jwt.verify(token, config.jwt.secret);
    return decoded;
  }
}

export default AuthService;
