import AuthService from '../../services/auth/AuthService.js';
import UserService from '../../services/users/UserService.js';
import express from 'express';
import { ConflictException } from '../../error.exceptions.js';
import { isEmpty, isValidEmail, isNonBlankString } from '../../services/ValidationsService.js';

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

    // email・passwordが文字列であり、空文字・空白のみでないことを確認する。
    // ここで弾かない場合、password未指定時にsearchUser相当の検索条件からpasswordが
    // 抜け落ちてemailの一致だけで認証されてしまう恐れがあるため、
    // ユーザー検索・JWT発行の前に必ず両方を required とする。
    // 存在しないメールアドレスの場合と区別できないよう、レスポンスは一致しない場合と同じ形にする。
    if (!isNonBlankString(email) || !isNonBlankString(password)) {
      return res.status(200).json({});
    }

    // ユーザー認証を行う（emailとpasswordの両方を必ず照合条件に含める）
    const resAuthUser = await userService.authenticateUser(email, password);

    // 一致しない場合は再ログインを促すため、空で返却する
    if (!resAuthUser.length) return res.status(200).json({});

    // トークンを発行する
    const user_id = resAuthUser[0].id;
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

    // メールアドレス形式チェック
    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, data: null, message: 'Invalid email format' });
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
