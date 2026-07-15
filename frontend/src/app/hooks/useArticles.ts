import { Article, ArticleListResponse, ArticleResponse } from "@/app/types/Article";
import { getStoredToken } from "@/app/utils/authStorage";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const authHeaders = (): HeadersInit => ({
	"Content-Type": "application/json",
	Authorization: `Bearer ${getStoredToken()}`,
});

export const useArticles = () => {
	const fetchArticles = async (): Promise<Article[]> => {
		const response = await fetch(`${API_BASE_URL}/articles`, {
			method: "GET",
			headers: authHeaders(),
		});
		const data: ArticleListResponse = await response.json();
		return data.data;
	};

	const fetchArticle = async (id: string | number): Promise<Article> => {
		const response = await fetch(`${API_BASE_URL}/articles/${id}`, {
			method: "GET",
			headers: authHeaders(),
		});
		const data: ArticleResponse = await response.json();
		return data.data;
	};

	const createArticle = async (
		title: string,
		content: string,
	): Promise<Article> => {
		const response = await fetch(`${API_BASE_URL}/articles`, {
			method: "POST",
			headers: authHeaders(),
			body: JSON.stringify({ title, content }),
		});
		const data: ArticleResponse = await response.json();
		return data.data;
	};

	const updateArticle = async (
		id: string | number,
		title: string,
		content: string,
	): Promise<Article> => {
		const response = await fetch(`${API_BASE_URL}/articles/${id}`, {
			method: "PUT",
			headers: authHeaders(),
			body: JSON.stringify({ title, content }),
		});
		const data: ArticleResponse = await response.json();
		return data.data;
	};

	const deleteArticle = async (id: string | number): Promise<void> => {
		await fetch(`${API_BASE_URL}/articles/${id}`, {
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
