import { render, screen, waitFor } from "@testing-library/react";
import AdminUsers from "../page";
import { LoginProvider } from "@/app/contexts/login";
import { saveLoginData } from "@/app/utils/authStorage";
import { ADMIN_EMAIL } from "@/app/config/admin";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
	useRouter: () => ({ push: pushMock }),
}));

function makeToken(payload: object): string {
	const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString(
		"base64",
	);
	const body = Buffer.from(JSON.stringify(payload)).toString("base64");
	return `${header}.${body}.signature`;
}

describe("AdminUsers（ユーザー管理）", () => {
	beforeEach(() => {
		localStorage.clear();
		pushMock.mockReset();
		jest.restoreAllMocks();
	});

	test("管理者アカウントでアクセスするとユーザー一覧が表示される", async () => {
		const token = makeToken({
			id: 1,
			email: ADMIN_EMAIL,
			exp: Math.floor(Date.now() / 1000) + 600,
		});
		saveLoginData({ email: ADMIN_EMAIL, token });

		global.fetch = jest.fn().mockResolvedValue({
			ok: true,
			status: 200,
			json: async () => ({
				success: true,
				data: [
					{
						id: 2,
						name: "テストユーザー",
						email: "test@test.com",
						created_at: "2026-01-01T00:00:00.000Z",
					},
				],
				message: "",
			}),
		}) as unknown as typeof fetch;

		render(
			<LoginProvider>
				<AdminUsers />
			</LoginProvider>,
		);

		expect(await screen.findByText("test@test.com")).toBeInTheDocument();
		expect(pushMock).not.toHaveBeenCalled();
	});

	test("管理者以外のアカウントでは一覧を取得せず/へリダイレクトされる", async () => {
		const token = makeToken({
			id: 2,
			email: "test@test.com",
			exp: Math.floor(Date.now() / 1000) + 600,
		});
		saveLoginData({ email: "test@test.com", token });

		global.fetch = jest.fn();

		render(
			<LoginProvider>
				<AdminUsers />
			</LoginProvider>,
		);

		await waitFor(() => {
			expect(pushMock).toHaveBeenCalledWith("/");
		});
		expect(global.fetch).not.toHaveBeenCalled();
	});

	test("未ログインの場合は/signinへリダイレクトされる", async () => {
		global.fetch = jest.fn();

		render(
			<LoginProvider>
				<AdminUsers />
			</LoginProvider>,
		);

		await waitFor(() => {
			expect(pushMock).toHaveBeenCalledWith("/signin");
		});
		expect(global.fetch).not.toHaveBeenCalled();
	});
});
