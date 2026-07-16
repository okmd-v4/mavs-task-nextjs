import { LoginResponse } from "@/app/types/Login/LoginResponse";

const STORAGE_KEY = "loginData";

function isTokenExpired(token: string): boolean {
	try {
		const payload = JSON.parse(atob(token.split(".")[1]));
		if (!payload.exp) return false;
		return Date.now() >= payload.exp * 1000;
	} catch {
		return true;
	}
}

export function loadLoginData(): LoginResponse | undefined {
	const raw = localStorage.getItem(STORAGE_KEY);
	if (!raw) return undefined;
	try {
		const data: LoginResponse = JSON.parse(raw);
		if (!data.token || isTokenExpired(data.token)) {
			localStorage.removeItem(STORAGE_KEY);
			return undefined;
		}
		return data;
	} catch {
		localStorage.removeItem(STORAGE_KEY);
		return undefined;
	}
}

export function saveLoginData(data: LoginResponse | undefined): void {
	if (data) {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
	} else {
		localStorage.removeItem(STORAGE_KEY);
	}
}

export function getStoredToken(): string {
	return loadLoginData()?.token ?? "";
}
