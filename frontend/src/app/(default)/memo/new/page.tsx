"use client";
import { useRouter } from "next/navigation";
import { useArticles } from "@/app/hooks/useArticles";
import ArticleForm from "../../../components/ArticleForm";

export default function NewMemo() {
	const router = useRouter();
	const { createArticle } = useArticles();

	const handleSave = async (title: string, content: string) => {
		await createArticle(title, content);
		router.push("/");
	};

	return (
		<div>
			<h2>メモ新規作成</h2>
			<ArticleForm onSave={handleSave} onCancel={() => router.push("/")} />
		</div>
	);
}
