"use client";
import { useForm } from "react-hook-form";
import { LoginRequest } from "@/app/types/Login/LoginReqest";
import { LoginResponse } from "@/app/types/Login/LoginResponse";
import { useLoginData } from "@/app/hooks/useLoginData";
import { useRouter } from "next/navigation";
import styles from "./loginForm.module.css";

export default function LoginForm() {
	const router = useRouter();
	const { setLoginData } = useLoginData();
	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<LoginRequest>();
	const onSubmit = handleSubmit(async (request: LoginRequest) => {
		const response = await fetch(
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
		const data: LoginResponse = await response.json();
		if (data.token) {
			// トークンの保持（localStorageへの保存はLoginProviderが行う）
			setLoginData(data);
			router.push("/");
		} else {
			reset();
		}
	});
	return (
		<form onSubmit={onSubmit}>
			<input className={styles.loginForm_input} {...register("email")} />
			<input
				className={styles.loginForm_input}
				{...register("password")}
				type="password"
			/>
			<button>送信</button>
		</form>
	);
}
