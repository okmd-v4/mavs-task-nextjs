"use client";
import { useRouter } from "next/navigation";
import styles from "./header.module.css";
import { useLoginData } from "@/app/hooks/useLoginData";
import { saveLoginData } from "@/app/utils/authStorage";

export default function Header() {
	const router = useRouter();
	const { loginData, setLoginData } = useLoginData();

	const logout = () => {
		saveLoginData(undefined);
		setLoginData(undefined);
		router.push("/");
	};
	return (
		<div className={styles.header}>
			<h1 className={styles.header_logo} onClick={() => router.push("/")}>
				メモアプリ
			</h1>
			<div className={styles.header_userInfo}>
				{loginData && (
					<span className={styles.header_greeting}>
						ようこそ！{loginData.email}さん
					</span>
				)}

				{loginData ? (
					<button onClick={logout}>ログアウト</button>
				) : (
					<button onClick={() => router.push("/signin")}>サインイン</button>
				)}
			</div>
		</div>
	);
}
