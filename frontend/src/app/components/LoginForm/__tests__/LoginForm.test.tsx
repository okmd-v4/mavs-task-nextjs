import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginForm from "../index";
import { LoginProvider } from "@/app/contexts/login";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
	useRouter: () => ({ push: pushMock }),
}));

function renderForm() {
	return render(
		<LoginProvider>
			<LoginForm />
		</LoginProvider>,
	);
}

function fillForm(
	container: HTMLElement,
	email: string,
	password: string,
) {
	const emailInput = container.querySelector(
		'input[name="email"]',
	) as HTMLInputElement;
	const passwordInput = container.querySelector(
		'input[name="password"]',
	) as HTMLInputElement;
	fireEvent.change(emailInput, { target: { value: email } });
	fireEvent.change(passwordInput, { target: { value: password } });
}

describe("LoginForm", () => {
	beforeEach(() => {
		localStorage.clear();
		pushMock.mockReset();
		jest.restoreAllMocks();
	});

	test("未入力ではサインインAPIを呼ばない", async () => {
		global.fetch = jest.fn();
		renderForm();

		fireEvent.click(screen.getByRole("button", { name: "送信" }));

		await waitFor(() => {
			expect(global.fetch).not.toHaveBeenCalled();
		});
	});

	test("メールアドレス形式が不正な場合はサインインAPIを呼ばない", async () => {
		global.fetch = jest.fn();
		const { container } = renderForm();

		fillForm(container, "invalid-email", "password123");
		fireEvent.click(screen.getByRole("button", { name: "送信" }));

		await waitFor(() => {
			expect(global.fetch).not.toHaveBeenCalled();
		});
	});

	test("誤ったログイン情報の場合は共通のエラーメッセージを表示する", async () => {
		global.fetch = jest.fn().mockResolvedValue({
			ok: true,
			json: async () => ({}),
		}) as unknown as typeof fetch;

		const { container } = renderForm();
		fillForm(container, "test@test.com", "wrong-password");
		fireEvent.click(screen.getByRole("button", { name: "送信" }));

		expect(
			await screen.findByText(
				"メールアドレスまたはパスワードが正しくありません",
			),
		).toBeInTheDocument();
		// 入力内容は消えない
		expect(
			(container.querySelector('input[name="email"]') as HTMLInputElement)
				.value,
		).toBe("test@test.com");
	});

	test("500エラーの場合はサーバーエラーメッセージを表示する", async () => {
		global.fetch = jest.fn().mockResolvedValue({
			ok: false,
			status: 500,
			json: async () => ({}),
		}) as unknown as typeof fetch;

		const { container } = renderForm();
		fillForm(container, "test@test.com", "password123");
		fireEvent.click(screen.getByRole("button", { name: "送信" }));

		expect(
			await screen.findByText(/サーバーエラーが発生しました/),
		).toBeInTheDocument();
	});

	test("通信失敗の場合はネットワークエラーメッセージを表示する", async () => {
		global.fetch = jest.fn().mockRejectedValue(new Error("network error"));

		const { container } = renderForm();
		fillForm(container, "test@test.com", "password123");
		fireEvent.click(screen.getByRole("button", { name: "送信" }));

		expect(
			await screen.findByText(/通信に失敗しました/),
		).toBeInTheDocument();
	});

	test("ログイン成功時にログイン情報を保存してトップ画面へ移動する", async () => {
		global.fetch = jest.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ email: "test@test.com", token: "dummy-token" }),
		}) as unknown as typeof fetch;

		const { container } = renderForm();
		fillForm(container, "test@test.com", "password123");
		fireEvent.click(screen.getByRole("button", { name: "送信" }));

		await waitFor(() => {
			expect(pushMock).toHaveBeenCalledWith("/");
		});
		expect(localStorage.getItem("loginData")).toContain("dummy-token");
	});
});
