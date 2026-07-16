"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useArticles } from "@/app/hooks/useArticles";
import { useRequireAuth } from "@/app/hooks/useRequireAuth";
import { ApiError } from "@/app/utils/ApiError";
import ArticleForm from "../../../components/ArticleForm";

export default function NewMemo() {
	const router = useRouter();
	const { isRestored, isReady } = useRequireAuth();
	const { createArticle } = useArticles();
	const [error, setError] = useState<string | null>(null);

	const handleSave = async (title: string, content: string) => {
		try {
			await createArticle(title, content);
			router.push("/");
		} catch (err) {
			setError(err instanceof ApiError ? err.message : "メモの作成に失敗しました");
		}
	};

	if (!isRestored) {
		return <p>読み込み中...</p>;
	}
	if (!isReady) {
		return null;
	}

	return (
		<div>
			<h2>メモ新規作成</h2>
			{error && <p>{error}</p>}
			<ArticleForm onSave={handleSave} onCancel={() => router.push("/")} />
		</div>
	);
}
