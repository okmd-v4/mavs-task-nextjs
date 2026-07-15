"use client";
import { useRouter } from "next/navigation";
import { Article, ArticleListResponse, ArticleResponse } from "@/app/types/Article";
import { getStoredToken, saveLoginData } from "@/app/utils/authStorage";
import { ApiError } from "@/app/utils/ApiError";
import { useLoginData } from "@/app/hooks/useLoginData";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const authHeaders = (): HeadersInit => ({
	"Content-Type": "application/json",
	Authorization: `Bearer ${getStoredToken()}`,
});

const defaultMessageFor = (status: number): string => {
	switch (status) {
		case 400:
			return "入力内容に誤りがあります";
		case 404:
			return "メモが見つかりません";
		case 500:
			return "サーバーエラーが発生しました。しばらくしてから再度お試しください";
		default:
			return "エラーが発生しました";
	}
};

export const useArticles = () => {
	const router = useRouter();
	const { setLoginData } = useLoginData();

	const request = async <T,>(url: string, init?: RequestInit): Promise<T> => {
		let response: Response;
		try {
			response = await fetch(url, init);
		} catch {
			throw new ApiError(
				0,
				"通信に失敗しました。ネットワーク環境をご確認ください。",
			);
		}

		if (response.status === 401) {
			// 保存済みログイン情報を削除してサインイン画面へ
			saveLoginData(undefined);
			setLoginData(undefined);
			router.push("/signin");
			throw new ApiError(401, "認証の有効期限が切れました。再度サインインしてください。");
		}

		let body: { message?: string } | null = null;
		try {
			body = await response.json();
		} catch {
			body = null;
		}

		if (!response.ok) {
			throw new ApiError(response.status, body?.message || defaultMessageFor(response.status));
		}

		return body as T;
	};

	const fetchArticles = async (): Promise<Article[]> => {
		const data = await request<ArticleListResponse>(`${API_BASE_URL}/articles`, {
			method: "GET",
			headers: authHeaders(),
		});
		return data.data;
	};

	const fetchArticle = async (id: string | number): Promise<Article> => {
		const data = await request<ArticleResponse>(`${API_BASE_URL}/articles/${id}`, {
			method: "GET",
			headers: authHeaders(),
		});
		return data.data;
	};

	const createArticle = async (
		title: string,
		content: string,
	): Promise<Article> => {
		const data = await request<ArticleResponse>(`${API_BASE_URL}/articles`, {
			method: "POST",
			headers: authHeaders(),
			body: JSON.stringify({ title, content }),
		});
		return data.data;
	};

	const updateArticle = async (
		id: string | number,
		title: string,
		content: string,
	): Promise<Article> => {
		const data = await request<ArticleResponse>(`${API_BASE_URL}/articles/${id}`, {
			method: "PUT",
			headers: authHeaders(),
			body: JSON.stringify({ title, content }),
		});
		return data.data;
	};

	const deleteArticle = async (id: string | number): Promise<void> => {
		await request<{ data: null }>(`${API_BASE_URL}/articles/${id}`, {
			method: "DELETE",
			headers: authHeaders(),
		});
	};

	return {
		fetchArticles,
		fetchArticle,
		createArticle,
		updateArticle,
		deleteArticle,
	};
};
