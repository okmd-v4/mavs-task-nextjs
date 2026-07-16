"use client";
import { useRouter } from "next/navigation";
import { User, UserListResponse } from "@/app/types/User";
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
		case 403:
			return "この操作を行う権限がありません";
		case 404:
			return "ユーザーが見つかりません";
		case 500:
			return "サーバーエラーが発生しました。しばらくしてから再度お試しください";
		default:
			return "エラーが発生しました";
	}
};

export const useUsers = () => {
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

	const fetchUsers = async (): Promise<User[]> => {
		const data = await request<UserListResponse>(`${API_BASE_URL}/users`, {
			method: "GET",
			headers: authHeaders(),
		});
		return data.data;
	};

	const deleteUser = async (id: number): Promise<void> => {
		await request<{ data: null }>(`${API_BASE_URL}/users/${id}`, {
			method: "DELETE",
			headers: authHeaders(),
		});
	};

	return { fetchUsers, deleteUser };
};
