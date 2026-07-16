"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLoginData } from "@/app/hooks/useLoginData";
import { ADMIN_EMAIL } from "@/app/config/admin";

/**
 * 管理者アカウント（ADMIN_EMAIL）以外はアクセスさせない。
 * 未ログインなら/signinへ、ログイン済みだが管理者でなければ/へ遷移する。
 * localStorageからのログイン情報復元(isRestored)が終わるまでは判定を保留し、
 * 誤ったリダイレクトを防ぐ。
 */
export const useRequireAdmin = () => {
	const router = useRouter();
	const { loginData, isRestored } = useLoginData();

	useEffect(() => {
		if (!isRestored) return;
		if (!loginData) {
			router.push("/signin");
			return;
		}
		if (loginData.email !== ADMIN_EMAIL) {
			router.push("/");
		}
	}, [isRestored, loginData, router]);

	const isReady =
		isRestored && !!loginData && loginData.email === ADMIN_EMAIL;

	return { isRestored, isReady };
};
