import { jest, describe, expect, test, beforeEach } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';

const mockGetArticleList = jest.fn();
const mockGetArticle = jest.fn();
const mockCreateArticle = jest.fn();
const mockUpdateArticle = jest.fn();
const mockDeleteArticle = jest.fn();

jest.unstable_mockModule('../../../services/articles/ArticleService.js', () => ({
  default: jest.fn().mockImplementation(() => ({
    getArticleList: mockGetArticleList,
    getArticle: mockGetArticle,
    createArticle: mockCreateArticle,
    updateArticle: mockUpdateArticle,
    deleteArticle: mockDeleteArticle,
  })),
}));

const { default: articlesRouter } = await import('../articles.router.js');
const { default: jwtConfig } = await import('../../../config/jwt-config.js');
const { NotFoundException } = await import('../../../error.exceptions.js');

const app = express();
app.use(express.json());
app.use('/articles', articlesRouter);

const validToken = jwt.sign({ id: 1, email: 'test@test.com' }, jwtConfig.jwt.secret, jwtConfig.jwt.options);

describe('articles.router', () => {
  beforeEach(() => {
    mockGetArticleList.mockReset();
    mockGetArticle.mockReset();
    mockCreateArticle.mockReset();
    mockUpdateArticle.mockReset();
    mockDeleteArticle.mockReset();
  });

  test('未認証のメモAPIアクセスは401になる', async () => {
    const res = await request(app).get('/articles');
    expect(res.status).toBe(401);
  });

  test('Authorizationヘッダーがない状態でPOSTしても401になる', async () => {
    const res = await request(app).post('/articles').send({ title: 't', content: 'c' });
    expect(res.status).toBe(401);
    expect(mockCreateArticle).not.toHaveBeenCalled();
  });

  test('認証済みなら一覧を取得できる', async () => {
    mockGetArticleList.mockResolvedValue([{ id: 1, title: 't', content: 'c', author_id: 1 }]);

    const res = await request(app).get('/articles').set('Authorization', `Bearer ${validToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockGetArticleList).toHaveBeenCalledWith(1);
  });

  test('タイトル未入力は400を返しcreateArticleは呼ばれない', async () => {
    const res = await request(app)
      .post('/articles')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ title: '', content: 'c' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(mockCreateArticle).not.toHaveBeenCalled();
  });

  test('タイトルが101文字以上は400を返す', async () => {
    const res = await request(app)
      .post('/articles')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ title: 'a'.repeat(101), content: 'c' });

    expect(res.status).toBe(400);
    expect(mockCreateArticle).not.toHaveBeenCalled();
  });

  test('本文未入力は400を返す', async () => {
    const res = await request(app)
      .post('/articles')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ title: 't', content: '' });

    expect(res.status).toBe(400);
    expect(mockCreateArticle).not.toHaveBeenCalled();
  });

  test('タイトル・本文が正しい場合は201でメモを作成する', async () => {
    mockCreateArticle.mockResolvedValue({ id: 1, title: 't', content: 'c', author_id: 1 });

    const res = await request(app)
      .post('/articles')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ title: 't', content: 'c' });

    expect(res.status).toBe(201);
    expect(mockCreateArticle).toHaveBeenCalledWith(1, 't', 'c');
  });

  test('URLのメモIDが0の場合は400を返す', async () => {
    const res = await request(app).get('/articles/0').set('Authorization', `Bearer ${validToken}`);
    expect(res.status).toBe(400);
    expect(mockGetArticle).not.toHaveBeenCalled();
  });

  test('URLのメモIDが数値以外の場合は400を返す', async () => {
    const res = await request(app).get('/articles/abc').set('Authorization', `Bearer ${validToken}`);
    expect(res.status).toBe(400);
  });

  test('他ユーザーのメモ取得は404を返す', async () => {
    mockGetArticle.mockRejectedValue(new NotFoundException('Article not found'));

    const res = await request(app).get('/articles/999').set('Authorization', `Bearer ${validToken}`);

    expect(res.status).toBe(404);
  });

  test('他ユーザーのメモ更新は404を返す', async () => {
    mockUpdateArticle.mockRejectedValue(new NotFoundException('Article not found'));

    const res = await request(app)
      .put('/articles/999')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ title: 't', content: 'c' });

    expect(res.status).toBe(404);
  });

  test('他ユーザーのメモ削除は404を返す', async () => {
    mockDeleteArticle.mockRejectedValue(new NotFoundException('Article not found'));

    const res = await request(app).delete('/articles/999').set('Authorization', `Bearer ${validToken}`);

    expect(res.status).toBe(404);
  });
});
