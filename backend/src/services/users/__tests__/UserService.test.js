import { jest, describe, expect, test, beforeEach } from '@jest/globals';

const mockFindAll = jest.fn();
const mockFindOne = jest.fn();
const mockCreate = jest.fn();

jest.unstable_mockModule('../../../models/index.js', () => ({
  default: {
    Users: {
      findAll: mockFindAll,
      findOne: mockFindOne,
      create: mockCreate,
    },
  },
}));

const { default: UserService } = await import('../UserService.js');

describe('UserService.authenticateUser', () => {
  let userService;

  beforeEach(() => {
    userService = new UserService();
    mockFindAll.mockReset();
    mockFindOne.mockReset();
    mockCreate.mockReset();
  });

  // 空パスワードによる認証回避の再発防止用の回帰テスト。
  // searchUserはpasswordが偽値（''など）の場合、where句からpassword条件を
  // 省略してしまい、emailの一致だけで認証が通ってしまうバグがあった。
  // authenticateUserは常にemail・password両方をwhere句に含めなければならない。
  test.each(['', ' ', '   '])(
    'パスワードが %j でもemail・passwordの両方が必ず検索条件に含まれる（省略されない）',
    async (password) => {
      mockFindAll.mockResolvedValue([]);

      await userService.authenticateUser('test@test.com', password);

      expect(mockFindAll).toHaveBeenCalledTimes(1);
      const [{ where }] = mockFindAll.mock.calls[0];
      expect(where).toHaveProperty('email', 'test@test.com');
      expect(where).toHaveProperty('password');
      expect(where.password).not.toBeUndefined();
    },
  );

  test('emailとpassword(ハッシュ化後)が一致した場合のみユーザーを返す', async () => {
    mockFindAll.mockResolvedValue([
      { dataValues: { id: 1, name: 'test', email: 'test@test.com' } },
    ]);

    const result = await userService.authenticateUser('test@test.com', 'password');

    expect(result).toEqual([{ id: 1, name: 'test', email: 'test@test.com' }]);
  });

  test('一致しない場合は空配列を返す（パスワードだけ・メールだけの一致では認証しない）', async () => {
    mockFindAll.mockResolvedValue([]);

    const result = await userService.authenticateUser('test@test.com', 'wrong-password');

    expect(result).toEqual([]);
  });

  test('同じパスワード文字列は毎回同じハッシュ値でクエリされる（SHA-256照合方式を維持）', async () => {
    mockFindAll.mockResolvedValue([]);

    await userService.authenticateUser('a@test.com', 'password');
    await userService.authenticateUser('b@test.com', 'password');

    const hash1 = mockFindAll.mock.calls[0][0].where.password;
    const hash2 = mockFindAll.mock.calls[1][0].where.password;
    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe('password');
  });
});

describe('UserService.getUserList', () => {
  let userService;

  beforeEach(() => {
    userService = new UserService();
    mockFindAll.mockReset();
  });

  test('全ユーザーをid昇順で返し、passwordは含めない', async () => {
    mockFindAll.mockResolvedValue([
      {
        dataValues: {
          id: 1,
          name: 'a',
          email: 'a@test.com',
          password: 'hashed',
          created_at: '2026-01-01T00:00:00.000Z',
        },
      },
    ]);

    const result = await userService.getUserList();

    expect(mockFindAll).toHaveBeenCalledWith({ order: [['id', 'ASC']] });
    expect(result).toEqual([
      { id: 1, name: 'a', email: 'a@test.com', created_at: '2026-01-01T00:00:00.000Z' },
    ]);
    expect(result[0]).not.toHaveProperty('password');
  });
});

describe('UserService.deleteUser', () => {
  let userService;

  beforeEach(() => {
    userService = new UserService();
    mockFindOne.mockReset();
  });

  test('存在するユーザーを削除する', async () => {
    const destroy = jest.fn().mockResolvedValue(undefined);
    mockFindOne.mockResolvedValue({ destroy });

    await userService.deleteUser(1);

    expect(mockFindOne).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(destroy).toHaveBeenCalled();
  });

  test('存在しないユーザーの削除はNotFoundExceptionを投げる', async () => {
    mockFindOne.mockResolvedValue(null);
    const { NotFoundException } = await import('../../../error.exceptions.js');

    await expect(userService.deleteUser(999)).rejects.toThrow(NotFoundException);
  });
});
