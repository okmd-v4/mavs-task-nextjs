import { jest, describe, expect, test, beforeEach } from '@jest/globals';
import express from 'express';
import request from 'supertest';

const mockAuthenticateUser = jest.fn();
const mockCreateUser = jest.fn();

jest.unstable_mockModule('../../../services/users/UserService.js', () => ({
  default: jest.fn().mockImplementation(() => ({
    authenticateUser: mockAuthenticateUser,
    createUser: mockCreateUser,
  })),
}));

const { default: authRouter } = await import('../auth.router.js');

const app = express();
app.use(express.json());
app.use('/auth', authRouter);

describe('auth.router', () => {
  beforeEach(() => {
    mockAuthenticateUser.mockReset();
    mockCreateUser.mockReset();
  });

  describe('POST /auth/signin', () => {
    test('正しいメールアドレス・パスワードでログインできる', async () => {
      mockAuthenticateUser.mockResolvedValue([{ id: 1, name: 'test', email: 'test@test.com' }]);

      const res = await request(app)
        .post('/auth/signin')
        .send({ email: 'test@test.com', password: 'password' });

      expect(res.status).toBe(200);
      expect(res.body.email).toBe('test@test.com');
      expect(typeof res.body.token).toBe('string');
      expect(res.body.token.length).toBeGreaterThan(0);
      expect(mockAuthenticateUser).toHaveBeenCalledWith('test@test.com', 'password');
    });

    test('誤ったパスワードの場合はログインできない（トークンが発行されない）', async () => {
      mockAuthenticateUser.mockResolvedValue([]);

      const res = await request(app)
        .post('/auth/signin')
        .send({ email: 'test@test.com', password: 'wrong-password' });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeUndefined();
    });

    test('メールアドレス未指定ではログインできない（ユーザー検索を行わない）', async () => {
      const res = await request(app)
        .post('/auth/signin')
        .send({ password: 'password' });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeUndefined();
      expect(mockAuthenticateUser).not.toHaveBeenCalled();
    });

    test('パスワード未指定ではログインできない（ユーザー検索を行わない）', async () => {
      const res = await request(app)
        .post('/auth/signin')
        .send({ email: 'test@test.com' });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeUndefined();
      expect(mockAuthenticateUser).not.toHaveBeenCalled();
    });

    test('空文字のパスワードではログインできない（メールアドレスだけで認証されない）', async () => {
      const res = await request(app)
        .post('/auth/signin')
        .send({ email: 'test@test.com', password: '' });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeUndefined();
      expect(mockAuthenticateUser).not.toHaveBeenCalled();
    });

    test('空白だけのパスワードではログインできない', async () => {
      const res = await request(app)
        .post('/auth/signin')
        .send({ email: 'test@test.com', password: '   ' });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeUndefined();
      expect(mockAuthenticateUser).not.toHaveBeenCalled();
    });

    test('空白だけのメールアドレスではログインできない', async () => {
      const res = await request(app)
        .post('/auth/signin')
        .send({ email: '   ', password: 'password' });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeUndefined();
      expect(mockAuthenticateUser).not.toHaveBeenCalled();
    });

    test('emailやpasswordが文字列でない場合はユーザー検索を行わない', async () => {
      const res = await request(app)
        .post('/auth/signin')
        .send({ email: { $ne: null }, password: { $ne: null } });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeUndefined();
      expect(mockAuthenticateUser).not.toHaveBeenCalled();
    });

    test('存在しないメールアドレスの場合とパスワード不一致の場合で同じレスポンスを返す（判別不可）', async () => {
      mockAuthenticateUser.mockResolvedValue([]);
      const resNotFound = await request(app)
        .post('/auth/signin')
        .send({ email: 'unknown@test.com', password: 'password' });

      mockAuthenticateUser.mockResolvedValue([]);
      const resWrongPassword = await request(app)
        .post('/auth/signin')
        .send({ email: 'test@test.com', password: 'wrong-password' });

      expect(resNotFound.status).toBe(resWrongPassword.status);
      expect(resNotFound.body).toEqual(resWrongPassword.body);
    });
  });

  describe('POST /auth/signup', () => {
    test('全フィールド未入力は400を返す', async () => {
      const res = await request(app).post('/auth/signup').send({});
      expect(res.status).toBe(400);
      expect(mockCreateUser).not.toHaveBeenCalled();
    });

    test('メールアドレス形式が不正な場合は400を返す', async () => {
      const res = await request(app).post('/auth/signup').send({
        name: 'test',
        email: 'invalid-email',
        password: 'password123',
        passwordConfirm: 'password123',
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/email/i);
      expect(mockCreateUser).not.toHaveBeenCalled();
    });

    test('パスワードが6文字未満の場合は400を返す', async () => {
      const res = await request(app).post('/auth/signup').send({
        name: 'test',
        email: 'test@test.com',
        password: '123',
        passwordConfirm: '123',
      });

      expect(res.status).toBe(400);
      expect(mockCreateUser).not.toHaveBeenCalled();
    });

    test('passwordとpasswordConfirmが一致しない場合は400を返す', async () => {
      const res = await request(app).post('/auth/signup').send({
        name: 'test',
        email: 'test@test.com',
        password: 'password123',
        passwordConfirm: 'different123',
      });

      expect(res.status).toBe(400);
      expect(mockCreateUser).not.toHaveBeenCalled();
    });

    test('正しい入力の場合は201でユーザーを作成する', async () => {
      mockCreateUser.mockResolvedValue({ id: 1, name: 'test', email: 'test@test.com' });

      const res = await request(app).post('/auth/signup').send({
        name: 'test',
        email: 'test@test.com',
        password: 'password123',
        passwordConfirm: 'password123',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(mockCreateUser).toHaveBeenCalledWith('test', 'test@test.com', 'password123');
    });
  });
});
