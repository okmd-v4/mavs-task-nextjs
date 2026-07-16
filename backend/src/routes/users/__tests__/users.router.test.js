import { jest, describe, expect, test, beforeEach } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';

const mockGetUserList = jest.fn();
const mockDeleteUser = jest.fn();

jest.unstable_mockModule('../../../services/users/UserService.js', () => ({
  default: jest.fn().mockImplementation(() => ({
    getUserList: mockGetUserList,
    deleteUser: mockDeleteUser,
  })),
}));

const { default: usersRouter } = await import('../users.router.js');
const { default: jwtConfig } = await import('../../../config/jwt-config.js');
const { default: adminConfig } = await import('../../../config/admin-config.js');
const { NotFoundException } = await import('../../../error.exceptions.js');

const app = express();
app.use(express.json());
app.use('/users', usersRouter);

const adminToken = jwt.sign(
  { id: 1, email: adminConfig.adminEmail },
  jwtConfig.jwt.secret,
  jwtConfig.jwt.options,
);
const nonAdminToken = jwt.sign(
  { id: 2, email: 'test@test.com' },
  jwtConfig.jwt.secret,
  jwtConfig.jwt.options,
);

describe('users.router', () => {
  beforeEach(() => {
    mockGetUserList.mockReset();
    mockDeleteUser.mockReset();
  });

  describe('GET /users', () => {
    test('未認証は401になる', async () => {
      const res = await request(app).get('/users');
      expect(res.status).toBe(401);
      expect(mockGetUserList).not.toHaveBeenCalled();
    });

    test('管理者以外は403になる', async () => {
      const res = await request(app).get('/users').set('Authorization', `Bearer ${nonAdminToken}`);
      expect(res.status).toBe(403);
      expect(mockGetUserList).not.toHaveBeenCalled();
    });

    test('管理者はユーザー一覧を取得できる', async () => {
      mockGetUserList.mockResolvedValue([
        { id: 1, name: 'admin', email: adminConfig.adminEmail, created_at: '2026-01-01' },
      ]);

      const res = await request(app).get('/users').set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('DELETE /users/:id', () => {
    test('未認証は401になる', async () => {
      const res = await request(app).delete('/users/2');
      expect(res.status).toBe(401);
      expect(mockDeleteUser).not.toHaveBeenCalled();
    });

    test('管理者以外は403になる', async () => {
      const res = await request(app)
        .delete('/users/2')
        .set('Authorization', `Bearer ${nonAdminToken}`);
      expect(res.status).toBe(403);
      expect(mockDeleteUser).not.toHaveBeenCalled();
    });

    test('不正なID(0)は400になる', async () => {
      const res = await request(app)
        .delete('/users/0')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(400);
      expect(mockDeleteUser).not.toHaveBeenCalled();
    });

    test('不正なID(数値以外)は400になる', async () => {
      const res = await request(app)
        .delete('/users/abc')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(400);
      expect(mockDeleteUser).not.toHaveBeenCalled();
    });

    test('管理者自身のアカウントは削除できない', async () => {
      const res = await request(app)
        .delete('/users/1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(mockDeleteUser).not.toHaveBeenCalled();
    });

    test('存在しないユーザーの削除は404になる', async () => {
      mockDeleteUser.mockRejectedValue(new NotFoundException('User not found'));

      const res = await request(app)
        .delete('/users/999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });

    test('管理者は他のユーザーを削除できる', async () => {
      mockDeleteUser.mockResolvedValue(undefined);

      const res = await request(app)
        .delete('/users/2')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockDeleteUser).toHaveBeenCalledWith('2');
    });
  });
});
