"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Article } from "@/app/types/Article";
import { useArticles } from "@/app/hooks/useArticles";
import MemoList from "../components/MemoList";
import styles from "./page.module.css";

export default function Home() {
	const router = useRouter();
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
		} catch {
			setError("メモの取得に失敗しました");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadArticles();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleDeleteConfirm = async () => {
		if (deleteTargetId === null) return;
		await deleteArticle(deleteTargetId);
		setDeleteTargetId(null);
		loadArticles();
	};

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
