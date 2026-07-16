"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Article } from "@/app/types/Article";
import { useArticles } from "@/app/hooks/useArticles";
import { useRequireAuth } from "@/app/hooks/useRequireAuth";
import { ApiError } from "@/app/utils/ApiError";
import MemoList from "../components/MemoList";
import styles from "./page.module.css";

export default function Home() {
	const router = useRouter();
	const { isRestored, isReady } = useRequireAuth();
	const { fetchArticles, deleteArticle } = useArticles();
	const [articles, setArticles] = useState<Article[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

	const loadArticles = async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await fetchArticles();
			setArticles(data ?? []);
		} catch (err) {
			setError(err instanceof ApiError ? err.message : "メモの取得に失敗しました");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (!isReady) return;
		loadArticles();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isReady]);

	const handleDeleteConfirm = async () => {
		if (deleteTargetId === null) return;
		try {
			await deleteArticle(deleteTargetId);
			setDeleteTargetId(null);
			loadArticles();
		} catch (err) {
			setDeleteTargetId(null);
			setError(err instanceof ApiError ? err.message : "メモの削除に失敗しました");
		}
	};

	// ログイン状態の復元が終わるまでは何も描画しない（未ログイン判定のちらつき防止）
	if (!isRestored) {
		return <p>読み込み中...</p>;
	}
	// 未ログインの場合はuseRequireAuthがリダイレクトするので何も描画しない
	if (!isReady) {
		return null;
	}

	return (
		<div>
			<div className={styles.page_header}>
				<h2>メモ一覧</h2>
				<button onClick={() => router.push("/memo/new")}>新規作成</button>
			</div>
			<MemoList
				articles={articles}
				loading={loading}
				error={error}
				onEdit={(id) => router.push(`/memo/${id}`)}
				onDeleteRequest={(id) => setDeleteTargetId(id)}
			/>
			{deleteTargetId !== null && (
				<div className={styles.page_dialogOverlay}>
					<div className={styles.page_dialog}>
						<p>このメモを削除しますか？</p>
						<div className={styles.page_dialogActions}>
							<button onClick={handleDeleteConfirm}>削除する</button>
							<button onClick={() => setDeleteTargetId(null)}>キャンセル</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
