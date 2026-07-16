"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Article } from "@/app/types/Article";
import { useArticles } from "@/app/hooks/useArticles";
import { useRequireAuth } from "@/app/hooks/useRequireAuth";
import { ApiError } from "@/app/utils/ApiError";
import ArticleForm from "../../../components/ArticleForm";

export default function EditMemo() {
	const router = useRouter();
	const { id } = useParams<{ id: string }>();
	const { isRestored, isReady } = useRequireAuth();
	const { fetchArticle, updateArticle } = useArticles();
	const [article, setArticle] = useState<Article | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [saveError, setSaveError] = useState<string | null>(null);

	useEffect(() => {
		if (!isReady) return;
		(async () => {
			setLoading(true);
			setError(null);
			try {
				const data = await fetchArticle(id);
				setArticle(data);
			} catch (err) {
				setError(err instanceof ApiError ? err.message : "メモの取得に失敗しました");
			} finally {
				setLoading(false);
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id, isReady]);

	const handleSave = async (title: string, content: string) => {
		try {
			await updateArticle(id, title, content);
			router.push("/");
		} catch (err) {
			setSaveError(err instanceof ApiError ? err.message : "メモの更新に失敗しました");
		}
	};

	if (!isRestored) {
		return <p className="state-text">読み込み中...</p>;
	}
	if (!isReady) {
		return null;
	}
	if (loading) return <p className="state-text">読み込み中...</p>;
	if (error || !article)
		return <p className="error-text">{error ?? "メモが見つかりません"}</p>;

	return (
		<div>
			<h2>メモ編集</h2>
			{saveError && <p className="error-text">{saveError}</p>}
			<ArticleForm
				initialTitle={article.title}
				initialContent={article.content}
				onSave={handleSave}
				onCancel={() => router.push("/")}
			/>
		</div>
	);
}
