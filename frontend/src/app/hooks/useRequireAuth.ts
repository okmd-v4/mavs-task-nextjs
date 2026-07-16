"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLoginData } from "@/app/hooks/useLoginData";

/**
 * 未ログインの場合は/signinへ遷移させる。
 * localStorageからのログイン情報復元(isRestored)が終わるまでは
 * 判定を保留し、誤ってサインイン画面へ飛ばさないようにする。
 */
export const useRequireAuth = () => {
	const router = useRouter();
	const { loginData, isRestored } = useLoginData();

	useEffect(() => {
		if (isRestored && !loginData) {
			router.push("/signin");
		}
	}, [isRestored, loginData, router]);

	// isReady: 認証確認が終わり、かつログイン済みで画面を描画してよい状態
	const isReady = isRestored && !!loginData;

	return { loginData, isRestored, isReady };
};
