"use client";
import { useState } from "react";
import styles from "./articleForm.module.css";

const TITLE_MAX_LENGTH = 100;

type Props = {
	initialTitle?: string;
	initialContent?: string;
	onSave: (title: string, content: string) => void;
	onCancel: () => void;
};

export default function ArticleForm({
	initialTitle = "",
	initialContent = "",
	onSave,
	onCancel,
}: Props) {
	const [title, setTitle] = useState(initialTitle);
	const [content, setContent] = useState(initialContent);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSave(title, content);
	};

	return (
		<form onSubmit={handleSubmit}>
			<div className={styles.articleForm_field}>
				<input
					className={styles.articleForm_title}
					placeholder="タイトル"
					value={title}
					maxLength={TITLE_MAX_LENGTH}
					onChange={(e) => setTitle(e.target.value)}
				/>
				<div className={styles.articleForm_counter}>
					{title.length} / {TITLE_MAX_LENGTH}
				</div>
			</div>
			<div className={styles.articleForm_field}>
				<textarea
					className={styles.articleForm_content}
					placeholder="本文"
					value={content}
					onChange={(e) => setContent(e.target.value)}
				/>
			</div>
			<div className={styles.articleForm_actions}>
				<button type="submit">保存</button>
				<button type="button" onClick={onCancel}>
					キャンセル
				</button>
			</div>
		</form>
	);
}
