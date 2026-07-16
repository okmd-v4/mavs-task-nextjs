"use client";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { SignupRequest } from "@/app/types/Signup/SignupRequest";
import { SignupResponse } from "@/app/types/Signup/SignupResponse";
import styles from "./signupForm.module.css";

export default function SignupForm() {
	const router = useRouter();
	const [message, setMessage] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<SignupRequest>();

	const onSubmit = handleSubmit(async (request: SignupRequest) => {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/signup`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(request),
			},
		);
		const data: SignupResponse = await response.json();
		if (data.success) {
			setSuccess(true);
			setMessage("登録が完了しました。サインイン画面へ移動します。");
			setTimeout(() => {
				router.push("/signin");
			}, 3000);
		} else {
			setSuccess(false);
			setMessage(data.message);
		}
	});

	return (
		<form onSubmit={onSubmit}>
			{message && (
				<p className={success ? styles.signupForm_success : styles.signupForm_error}>
					{message}
				</p>
			)}
			<input
				className={styles.signupForm_input}
				placeholder="ユーザー名"
				{...register("name", { required: true })}
			/>
			{errors.name && <p className={styles.signupForm_error}>ユーザー名は必須です</p>}
			<input
				className={styles.signupForm_input}
				placeholder="メールアドレス"
				{...register("email", { required: true })}
			/>
			{errors.email && <p className={styles.signupForm_error}>メールアドレスは必須です</p>}
			<input
				className={styles.signupForm_input}
				placeholder="パスワード"
				type="password"
				{...register("password", { required: true, minLength: 6 })}
			/>
			{errors.password && (
				<p className={styles.signupForm_error}>パスワードは6文字以上で入力してください</p>
			)}
			<input
				className={styles.signupForm_input}
				placeholder="パスワード（確認）"
				type="password"
				{...register("passwordConfirm", { required: true })}
			/>
			{errors.passwordConfirm && (
				<p className={styles.signupForm_error}>確認用パスワードは必須です</p>
			)}
			<button
				type="submit"
				className={styles.signupForm_submit}
				disabled={success}
			>
				登録
			</button>
		</form>
	);
}
