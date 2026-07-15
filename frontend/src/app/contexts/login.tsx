"use client";
import {
	type Dispatch,
	type ReactNode,
	type SetStateAction,
	createContext,
	useEffect,
	useState,
} from "react";
import { LoginResponse } from "../types/Login/LoginResponse";
import { loadLoginData, saveLoginData } from "../utils/authStorage";

export const LoginContext = createContext<{
	loginData: LoginResponse | undefined;
	setLoginData: Dispatch<SetStateAction<LoginResponse | undefined>>;
}>({
	loginData: undefined,
	setLoginData: () => {},
});

export const LoginProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [loginData, setLoginData] = useState<LoginResponse | undefined>(
		undefined,
	);

	// 初回マウント時にlocalStorageからログイン状態を復元する
	useEffect(() => {
		const stored = loadLoginData();
		if (stored) setLoginData(stored);
	}, []);

	// ログイン状態が変化するたびにlocalStorageへ反映する
	useEffect(() => {
		saveLoginData(loginData);
	}, [loginData]);

	return (
		<LoginContext.Provider value={{ loginData, setLoginData }}>
			{children}
		</LoginContext.Provider>
	);
};
