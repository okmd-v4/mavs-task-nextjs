import { jest, describe, expect, test, beforeEach } from '@jest/globals';
import express from 'express';
import request from 'supertest';

const mockSearchUser = jest.fn();
const mockCreateUser = jest.fn();

jest.unstable_mockModule('../../../services/users/UserService.js', () => ({
  default: jest.fn().mockImplementation(() => ({
    searchUser: mockSearchUser,
    createUser: mockCreateUser,
  })),
}));

const { default: authRouter } = await import('../auth.router.js');

const app = express();
app.use(express.json());
app.use('/auth', authRouter);

describe('auth.router', () => {
  beforeEach(() => {
    mockSearchUser.mockReset();
    mockCreateUser.mockReset();
  });

  describe('POST /auth/signin', () => {
    test('正しいメールアドレス・パスワードでログインできる', async () => {
      mockSearchUser.mockResolvedValue([{ id: 1, name: 'test', email: 'test@test.com' }]);

      const res = await request(app)
        .post('/auth/signin')
        .send({ email: 'test@test.com', password: 'password' });

      expect(res.status).toBe(200);
      expect(res.body.email).toBe('test@test.com');
      expect(typeof res.body.token).toBe('string');
      expect(res.body.token.length).toBeGreaterThan(0);
    });

    test('誤ったパスワードの場合はログインできない（トークンが発行されない）', async () => {
      mockSearchUser.mockResolvedValue([]);

      const res = await request(app)
        .post('/auth/signin')
        .send({ email: 'test@test.com', password: 'wrong-password' });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeUndefined();
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
