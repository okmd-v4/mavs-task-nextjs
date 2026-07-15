import AuthService from '../../services/auth/AuthService.js';
import UserService from '../../services/users/UserService.js';
import express from 'express';
import { ConflictException } from '../../error.exceptions.js';
import { isEmpty } from '../../services/ValidationsService.js';

const router = express.Router();
const userService = new UserService();
const authService = new AuthService();

/**
 * サインイン
 */
router.post('/signin', async (req, res, next) => {
  try {
    // リクエストパラメーター
    const { email, password } = req.body;

    if (!email) return res.status(200).json({});

    // ユーザー存在チェックを行う
    const resSearchUser = await userService.searchUser('', '', email, password);

    // パラメータ存在しない場合は再ログインを促すため、空で返却する
    if (!resSearchUser.length) return res.status(200).json({});

    // トークンを発行する
    const user_id = resSearchUser[0].id;
    const resCreateToken = await authService.createToken(email, user_id);

    // 返却用データを生成
    const body = {
      email: email,
      token: resCreateToken,
    };

    res.status(200).json(body);
  } catch (error) {
    console.error(error);
    res.status(500).json({});
  }
});

/**
 * サインアップ
 */
router.post('/signup', async (req, res, next) => {
  try {
    // リクエストパラメーター
    const { name, email, password, passwordConfirm } = req.body;

    // 全フィールド必須
    if (isEmpty(name) || isEmpty(email) || isEmpty(password) || isEmpty(passwordConfirm)) {
      return res.status(400).json({ success: false, data: null, message: 'All fields are required' });
    }

    // パスワード6文字以上
    if (password.length < 6) {
      return res.status(400).json({ success: false, data: null, message: 'Password must be at least 6 characters' });
    }

    // passwordとpasswordConfirmが一致
    if (password !== passwordConfirm) {
      return res.status(400).json({ success: false, data: null, message: 'Passwords do not match' });
    }

    const data = await userService.createUser(name, email, password);

    res.status(201).json({ success: true, data, message: '' });
  } catch (error) {
    if (error instanceof ConflictException) {
      return res.status(409).json({ success: false, data: null, message: error.message });
    }
    console.error(error);
    res.status(500).json({ success: false, data: null, message: 'Internal Server Error' });
  }
});

export default router;
