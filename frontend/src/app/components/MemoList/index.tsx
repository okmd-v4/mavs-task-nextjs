"use client";
import { Article } from "@/app/types/Article";
import styles from "./memoList.module.css";

type Props = {
	articles: Article[];
	loading: boolean;
	error: string | null;
	onEdit: (id: number) => void;
	onDeleteRequest: (id: number) => void;
};

export default function MemoList({
	articles,
	loading,
	error,
	onEdit,
	onDeleteRequest,
}: Props) {
	if (loading) {
		return <p className={styles.memoList_state}>読み込み中...</p>;
	}

	if (error) {
		return <p className={styles.memoList_stateError}>{error}</p>;
	}

	if (!articles.length) {
		return <p className={styles.memoList_state}>メモがありません</p>;
	}

	return (
		<div className={styles.memoList_grid}>
			{articles.map((article) => (
				<div className={styles.memoList_card} key={article.id}>
					<div className={styles.memoList_title}>{article.title}</div>
					<div className={styles.memoList_content}>{article.content}</div>
					<div className={styles.memoList_actions}>
						<button onClick={() => onEdit(article.id)}>編集</button>
						<button
							className={styles.memoList_deleteButton}
							onClick={() => onDeleteRequest(article.id)}
						>
							削除
						</button>
					</div>
				</div>
			))}
		</div>
	);
}
