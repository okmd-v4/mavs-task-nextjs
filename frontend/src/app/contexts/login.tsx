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
import { loadLoginData } from "../utils/authStorage";

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

	// 初回マウント時にlocalStorageからログイン状態を復元する（読み取りのみ）。
	// localStorageへの保存/削除はサインイン・ログアウト側で明示的に行う
	// （このeffectで自動保存すると、React StrictModeの二重実行により
	// 復元前の空状態でlocalStorageを消してしまう競合が発生するため避けている）。
	useEffect(() => {
		const stored = loadLoginData();
		if (stored) setLoginData(stored);
	}, []);

	return (
		<LoginContext.Provider value={{ loginData, setLoginData }}>
			{children}
		</LoginContext.Provider>
	);
};
