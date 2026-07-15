import db from '../../models/index.js';
import { NotFoundException } from '../../error.exceptions.js';

// クラス
class ArticleService {
  /**
   * 記事一覧取得
   * @param user_id
   * @return メモ一覧
   */
  async getArticleList(user_id) {
    const rows = await db.Articles.findAll({
      where: { author_id: user_id },
      order: [['created_at', 'DESC']],
    });
    return rows.map((row) => row.dataValues);
  }

  /**
   * 記事情報取得
   * @param user_id
   * @param article_id
   * @return メモ情報
   */
  async getArticle(user_id, article_id) {
    const row = await db.Articles.findOne({
      where: { id: article_id, author_id: user_id },
    });
    if (!row) {
      throw new NotFoundException('Article not found');
    }
    return row.dataValues;
  }

  /**
   * 記事新規登録
   * @param user_id
   * @param title
   * @param content
   * @return 作成したメモ情報
   */
  async createArticle(user_id, title, content) {
    const row = await db.Articles.create({
      title,
      content,
      author_id: user_id,
    });
    return row.dataValues;
  }

  /**
   * 記事更新
   * @param user_id
   * @param article_id
   * @param title
   * @param content
   * @return 更新後のメモ情報
   */
  async updateArticle(user_id, article_id, title, content) {
    const row = await db.Articles.findOne({
      where: { id: article_id, author_id: user_id },
    });
    if (!row) {
      throw new NotFoundException('Article not found');
    }
    row.title = title;
    row.content = content;
    await row.save();
    return row.dataValues;
  }

  /**
   * 記事削除
   * @param user_id
   * @param article_id
   */
  async deleteArticle(user_id, article_id) {
    const row = await db.Articles.findOne({
      where: { id: article_id, author_id: user_id },
    });
    if (!row) {
      throw new NotFoundException('Article not found');
    }
    await row.destroy();
  }
}

export default ArticleService;
