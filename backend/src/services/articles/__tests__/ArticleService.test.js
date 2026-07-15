import { jest, describe, expect, test, beforeEach } from '@jest/globals';

const mockFindAll = jest.fn();
const mockFindOne = jest.fn();
const mockCreate = jest.fn();

jest.unstable_mockModule('../../../models/index.js', () => ({
  default: {
    Articles: {
      findAll: mockFindAll,
      findOne: mockFindOne,
      create: mockCreate,
    },
  },
}));

const { default: ArticleService } = await import('../ArticleService.js');
const { NotFoundException } = await import('../../../error.exceptions.js');

describe('ArticleService', () => {
  let articleService;

  beforeEach(() => {
    articleService = new ArticleService();
    mockFindAll.mockReset();
    mockFindOne.mockReset();
    mockCreate.mockReset();
  });

  describe('getArticleList', () => {
    test('自分のメモだけを取得する（author_idで絞り込む）', async () => {
      mockFindAll.mockResolvedValue([
        { dataValues: { id: 1, title: 'a', content: 'a', author_id: 1 } },
      ]);

      const result = await articleService.getArticleList(1);

      expect(mockFindAll).toHaveBeenCalledWith({
        where: { author_id: 1 },
        order: [['created_at', 'DESC']],
      });
      expect(result).toEqual([{ id: 1, title: 'a', content: 'a', author_id: 1 }]);
    });
  });

  describe('getArticle', () => {
    test('自分のメモを取得できる', async () => {
      mockFindOne.mockResolvedValue({
        dataValues: { id: 1, title: 'a', content: 'a', author_id: 1 },
      });

      const result = await articleService.getArticle(1, 1);

      expect(mockFindOne).toHaveBeenCalledWith({ where: { id: 1, author_id: 1 } });
      expect(result).toEqual({ id: 1, title: 'a', content: 'a', author_id: 1 });
    });

    test('他ユーザーのメモは取得できない（404相当の例外）', async () => {
      mockFindOne.mockResolvedValue(null);

      await expect(articleService.getArticle(2, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('createArticle', () => {
    test('author_idを設定してメモを作成する', async () => {
      mockCreate.mockResolvedValue({
        dataValues: { id: 1, title: 't', content: 'c', author_id: 5 },
      });

      const result = await articleService.createArticle(5, 't', 'c');

      expect(mockCreate).toHaveBeenCalledWith({ title: 't', content: 'c', author_id: 5 });
      expect(result.author_id).toBe(5);
    });
  });

  describe('updateArticle', () => {
    test('他ユーザーのメモは更新できない（404相当の例外）', async () => {
      mockFindOne.mockResolvedValue(null);

      await expect(articleService.updateArticle(2, 1, 't', 'c')).rejects.toThrow(NotFoundException);
    });

    test('自分のメモは更新できる', async () => {
      const save = jest.fn().mockResolvedValue(undefined);
      const row = { title: 'old', content: 'old', dataValues: {} };
      row.save = save;
      mockFindOne.mockResolvedValue(row);

      await articleService.updateArticle(1, 1, 'new', 'new-content');

      expect(row.title).toBe('new');
      expect(row.content).toBe('new-content');
      expect(save).toHaveBeenCalled();
    });
  });

  describe('deleteArticle', () => {
    test('他ユーザーのメモは削除できない（404相当の例外）', async () => {
      mockFindOne.mockResolvedValue(null);

      await expect(articleService.deleteArticle(2, 1)).rejects.toThrow(NotFoundException);
    });

    test('自分のメモは削除できる', async () => {
      const destroy = jest.fn().mockResolvedValue(undefined);
      mockFindOne.mockResolvedValue({ destroy });

      await articleService.deleteArticle(1, 1);

      expect(destroy).toHaveBeenCalled();
    });
  });
});
