import { render, screen, waitFor } from "@testing-library/react";
import Home from "../page";
import { LoginProvider } from "@/app/contexts/login";
import { saveLoginData } from "@/app/utils/authStorage";

jest.mock("next/navigation", () => ({
	useRouter: () => ({ push: jest.fn() }),
}));

function makeToken(payload: object): string {
	const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString(
		"base64",
	);
	const body = Buffer.from(JSON.stringify(payload)).toString("base64");
	return `${header}.${body}.signature`;
}

describe("Home（メモ一覧）", () => {
	beforeEach(() => {
		localStorage.clear();
		jest.restoreAllMocks();
	});

	test("ログイン済みでリロードしても、保存済みのメモ一覧が表示される（「メモがありません」にならない）", async () => {
		const token = makeToken({
			id: 1,
			email: "test@test.com",
			exp: Math.floor(Date.now() / 1000) + 600,
		});
		saveLoginData({ email: "test@test.com", token });

		global.fetch = jest.fn().mockResolvedValue({
			ok: true,
			status: 200,
			json: async () => ({
				success: true,
				data: [
					{
						id: 1,
						title: "買い物リスト",
						content: "牛乳を買う",
						author_id: 1,
						created_at: "",
						updated_at: "",
					},
				],
				message: "",
			}),
		}) as unknown as typeof fetch;

		render(
			<LoginProvider>
				<Home />
			</LoginProvider>,
		);

		expect(await screen.findByText("買い物リスト")).toBeInTheDocument();
		expect(screen.queryByText("メモがありません")).not.toBeInTheDocument();
	});

	test("未ログインの場合はメモ一覧を取得しない", async () => {
		global.fetch = jest.fn();

		render(
			<LoginProvider>
				<Home />
			</LoginProvider>,
		);

		await waitFor(() => {
			expect(screen.queryByText("メモ一覧")).not.toBeInTheDocument();
		});
		expect(global.fetch).not.toHaveBeenCalled();
	});
});
