"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { LoginRequest } from "@/app/types/Login/LoginReqest";
import { LoginResponse } from "@/app/types/Login/LoginResponse";
import { useLoginData } from "@/app/hooks/useLoginData";
import { useRouter } from "next/navigation";
import { saveLoginData } from "@/app/utils/authStorage";
import styles from "./loginForm.module.css";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginForm() {
	const router = useRouter();
	const { setLoginData } = useLoginData();
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginRequest>();

	const onSubmit = handleSubmit(async (request: LoginRequest) => {
		if (isSubmitting) return;
		setSubmitError(null);
		setIsSubmitting(true);
		try {
			let response: Response;
			try {
				response = await fetch(
					`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/signin`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							email: request.email,
							password: request.password,
						}),
					},
				);
			} catch {
				setSubmitError(
					"通信に失敗しました。ネットワーク環境をご確認ください。",
				);
				return;
			}

			if (!response.ok) {
				setSubmitError(
					"サーバーエラーが発生しました。しばらくしてから再度お試しください。",
				);
				return;
			}

			let data: LoginResponse | null = null;
			try {
				data = await response.json();
			} catch {
				setSubmitError("サーバーからの応答を処理できませんでした。");
				return;
			}

			if (data?.token) {
				// トークンの保持
				saveLoginData(data);
				setLoginData(data);
				router.push("/");
			} else {
				// メールアドレスの存在有無を推測させないよう共通のメッセージにする
				setSubmitError("メールアドレスまたはパスワードが正しくありません");
			}
		} finally {
			setIsSubmitting(false);
		}
	});

	return (
		<form onSubmit={onSubmit}>
			{submitError && <p className={styles.loginForm_error}>{submitError}</p>}
			<input
				className={styles.loginForm_input}
				{...register("email", {
					required: true,
					pattern: EMAIL_PATTERN,
				})}
			/>
			{errors.email && (
				<p className={styles.loginForm_error}>
					メールアドレスを正しい形式で入力してください
				</p>
			)}
			<input
				className={styles.loginForm_input}
				{...register("password", {
					required: true,
					validate: (value) => value.trim().length > 0,
				})}
				type="password"
			/>
			{errors.password && (
				<p className={styles.loginForm_error}>パスワードを入力してください</p>
			)}
			<button
				type="submit"
				className={styles.loginForm_submit}
				disabled={isSubmitting}
			>
				送信
			</button>
		</form>
	);
}
