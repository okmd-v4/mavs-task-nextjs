import { jest, describe, expect, test, beforeEach } from '@jest/globals';

const mockFindAll = jest.fn();
const mockCreate = jest.fn();

jest.unstable_mockModule('../../../models/index.js', () => ({
  default: {
    Users: {
      findAll: mockFindAll,
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
