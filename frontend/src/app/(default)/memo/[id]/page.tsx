"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Article } from "@/app/types/Article";
import { useArticles } from "@/app/hooks/useArticles";
import ArticleForm from "../../../components/ArticleForm";

export default function EditMemo() {
	const router = useRouter();
	const { id } = useParams<{ id: string }>();
	const { fetchArticle, updateArticle } = useArticles();
	const [article, setArticle] = useState<Article | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		(async () => {
			setLoading(true);
			setError(null);
			try {
				const data = await fetchArticle(id);
				setArticle(data);
			} catch {
				setError("メモの取得に失敗しました");
			} finally {
				setLoading(false);
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	const handleSave = async (title: string, content: string) => {
		await updateArticle(id, title, content);
		router.push("/");
	};

	if (loading) return <p>読み込み中...</p>;
	if (error || !article) return <p>{error ?? "メモが見つかりません"}</p>;

	return (
		<div>
			<h2>メモ編集</h2>
			<ArticleForm
				initialTitle={article.title}
				initialContent={article.content}
				onSave={handleSave}
				onCancel={() => router.push("/")}
			/>
		</div>
	);
}
