import { loadLoginData, saveLoginData, getStoredToken } from "../authStorage";

function makeToken(payload: object): string {
	const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString(
		"base64",
	);
	const body = Buffer.from(JSON.stringify(payload)).toString("base64");
	return `${header}.${body}.signature`;
}

describe("authStorage", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	test("saveLoginDataで保存した内容をloadLoginDataで復元できる（ログイン情報の保存と復元）", () => {
		const token = makeToken({
			id: 1,
			email: "test@test.com",
			exp: Math.floor(Date.now() / 1000) + 600,
		});
		saveLoginData({ email: "test@test.com", token });

		const restored = loadLoginData();

		expect(restored).toEqual({ email: "test@test.com", token });
	});

	test("saveLoginData(undefined)でlocalStorageから削除される", () => {
		const token = makeToken({ exp: Math.floor(Date.now() / 1000) + 600 });
		saveLoginData({ email: "a@test.com", token });

		saveLoginData(undefined);

		expect(loadLoginData()).toBeUndefined();
		expect(localStorage.getItem("loginData")).toBeNull();
	});

	test("期限切れのJWTはloadLoginDataで自動的に削除される", () => {
		const expiredToken = makeToken({ exp: Math.floor(Date.now() / 1000) - 10 });
		localStorage.setItem(
			"loginData",
			JSON.stringify({ email: "a@test.com", token: expiredToken }),
		);

		const restored = loadLoginData();

		expect(restored).toBeUndefined();
		expect(localStorage.getItem("loginData")).toBeNull();
	});

	test("getStoredTokenは保存されたトークンを返す", () => {
		const token = makeToken({ exp: Math.floor(Date.now() / 1000) + 600 });
		saveLoginData({ email: "a@test.com", token });

		expect(getStoredToken()).toBe(token);
	});

	test("未ログイン時のgetStoredTokenは空文字を返す", () => {
		expect(getStoredToken()).toBe("");
	});
});
