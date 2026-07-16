import UserService from '../../services/users/UserService.js';
import express from 'express';
import authenticate from '../../middleware/authenticate.js';
import requireAdmin from '../../middleware/requireAdmin.js';
import { NotFoundException } from '../../error.exceptions.js';
import { isValidId } from '../../services/ValidationsService.js';

const router = express.Router();
const userService = new UserService();

/**
 * ユーザー一覧取得（管理者のみ）
 */
router.get('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const data = await userService.getUserList();

    res.status(200).json({ success: true, data, message: '' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, data: null, message: 'Internal Server Error' });
  }
});

/**
 * ユーザー削除（管理者のみ）
 */
router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, data: null, message: 'Invalid user id' });
    }

    // 管理者自身のアカウントは削除させない
    if (Number(req.params.id) === req.user.id) {
      return res.status(400).json({ success: false, data: null, message: 'Cannot delete your own account' });
    }

    await userService.deleteUser(req.params.id);

    res.status(200).json({ success: true, data: null, message: '' });
  } catch (error) {
    if (error instanceof NotFoundException) {
      return res.status(404).json({ success: false, data: null, message: error.message });
    }
    console.error(error);
    res.status(500).json({ success: false, data: null, message: 'Internal Server Error' });
  }
});

export default router;
