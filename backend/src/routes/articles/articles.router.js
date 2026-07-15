import ArticleService from '../../services/articles/ArticleService.js';
import express from 'express';
import authenticate from '../../middleware/authenticate.js';
import { NotFoundException } from '../../error.exceptions.js';

const router = express.Router();
const articleService = new ArticleService();

/**
 * メモ一覧取得
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const data = await articleService.getArticleList(user_id);

    res.status(200).json({ success: true, data, message: '' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, data: null, message: 'Internal Server Error' });
  }
});

/**
 * メモ情報取得
 */
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const data = await articleService.getArticle(user_id, req.params.id);

    res.status(200).json({ success: true, data, message: '' });
  } catch (error) {
    if (error instanceof NotFoundException) {
      return res.status(404).json({ success: false, data: null, message: error.message });
    }
    console.error(error);
    res.status(500).json({ success: false, data: null, message: 'Internal Server Error' });
  }
});

/**
 * メモ新規登録
 */
router.post('/', authenticate, async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const { title, content } = req.body;
    const data = await articleService.createArticle(user_id, title, content);

    res.status(201).json({ success: true, data, message: '' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, data: null, message: 'Internal Server Error' });
  }
});

/**
 * メモ更新
 */
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const { title, content } = req.body;
    const data = await articleService.updateArticle(user_id, req.params.id, title, content);

    res.status(200).json({ success: true, data, message: '' });
  } catch (error) {
    if (error instanceof NotFoundException) {
      return res.status(404).json({ success: false, data: null, message: error.message });
    }
    console.error(error);
    res.status(500).json({ success: false, data: null, message: 'Internal Server Error' });
  }
});

/**
 * メモ削除
 */
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const user_id = req.user.id;
    await articleService.deleteArticle(user_id, req.params.id);

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
