// import nanoid from 'nanoid';
import db from '../../models/index.js';
import AuthService from '../auth/AuthService.js';
import { ConflictException, NotFoundException } from '../../error.exceptions.js';

const authService = new AuthService();

// クラス
class UserService {
  /**
   * ユーザー新規登録
   * @param name
   * @param email
   * @param password
   * @return 作成したユーザー情報
   */
  async createUser(name, email, password) {
    // メールアドレス重複チェックを行う
    const existingUsers = await this.searchUser('', '', email, '');
    if (existingUsers.length) {
      throw new ConflictException('Email already registered');
    }

    // パスワードをSHA-256でハッシュ化する
    const hash_password = authService.hashSha256(password);

    // ユーザーを登録する
    const row = await db.Users.create({
      name,
      email,
      password: hash_password,
    });

    return {
      id: row.dataValues.id,
      name: row.dataValues.name,
      email: row.dataValues.email,
    };
  }

  /**
   * ログイン認証専用のユーザー検索
   * email・passwordの両方を必ず検索条件に含める（searchUserはpasswordが未指定の場合に
   * 検索条件から除外してしまい、email一致だけで認証が通ってしまうため、ログインでは使用しない）
   * @param email
   * @param password
   * @return 認証に成功したユーザー情報リスト（一致しない場合は空配列）
   */
  async authenticateUser(email, password) {
    const hash_password = authService.hashSha256(password);
    const rows = await db.Users.findAll({ where: { email, password: hash_password } });

    const resDataList = [];
    for (const row of rows) {
      resDataList.push({
        id: row.dataValues.id,
        name: row.dataValues.name,
        email: row.dataValues.email,
      });
    }

    return resDataList;
  }

  /**
   * ユーザー情報取得
   * @param ユーザーID
   * @return ユーザー情報
   */
  async getUser(user_id) {
    // ユーザーIDをキーにユーザー情報を取得する
    const rows = await db.Users.findOne({ where: { id: user_id } });
    console.log(rows.dataValues);
    // 取得したデータを返却形式に整形して格納し返却する
    const resData = {
      id: rows.dataValues.id,
      name: rows.dataValues.name,
      email: rows.dataValues.email,
    };
    return resData;
  }
  /**
   * ユーザー一覧取得（管理者用）
   * @return ユーザー情報リスト（id昇順、passwordは含めない）
   */
  async getUserList() {
    const rows = await db.Users.findAll({ order: [['id', 'ASC']] });
    return rows.map((row) => ({
      id: row.dataValues.id,
      name: row.dataValues.name,
      email: row.dataValues.email,
      created_at: row.dataValues.created_at,
    }));
  }

  /**
   * ユーザー削除（管理者用）
   * @param user_id
   */
  async deleteUser(user_id) {
    const row = await db.Users.findOne({ where: { id: user_id } });
    if (!row) {
      throw new NotFoundException('User not found');
    }
    await row.destroy();
  }

  /**
   * ユーザー情報検索
   * @param 検索条件
   * @return ユーザー情報リスト
   */
  async searchUser(id, name, email, password) {
    const where = {};
    // IDが指定されている場合はIDを条件へ追加する
    if (id) {
      where.id = id;
    }
    // 名前が指定されている場合は名前を条件へ追加する
    if (name) {
      where.name = name;
    }
    // メールアドレスが指定されている場合はメールアドレスを条件へ追加する
    if (email) {
      where.email = email;
    }
    // パスワードが指定されている場合はパスワードを条件へ追加する
    if (password) {
      const hash_password = authService.hashSha256(password);
      where.password = hash_password;
    }

    // 検索実行
    const rows = await db.Users.findAll({ where });

    // 取得したデータを返却形式に整形して格納し返却する
    const resDataList = [];
    for (const row of rows) {
      const resData = {
        id: row.dataValues.id,
        name: row.dataValues.name,
        email: row.dataValues.email,
      };
      // 返却用リストへ格納する
      resDataList.push(resData);
    }

    return resDataList;
  }
}

export default UserService;
