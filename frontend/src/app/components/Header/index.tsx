"use client";
import { useRouter } from "next/navigation";
import styles from "./header.module.css";
import { useLoginData } from "@/app/hooks/useLoginData";

export default function Header() {
	const router = useRouter();
	const { loginData, setLoginData } = useLoginData();

	const logout = () => {
		// localStorageからの削除はLoginProviderが行う
		setLoginData(undefined);
		router.push("/");
	};
	return (
		<div className={styles.header}>
			<h1 className={styles.header_logo} onClick={() => router.push("/")}>
				メモアプリ
			</h1>
			<div>
				{loginData && (
					<div>
						<p>ようこそ！</p>
						<p>{loginData?.email}さん</p>
					</div>
				)}

				{loginData ? (
					<button onClick={logout}>ログアウト</button>
				) : (
					<button
						className={styles.header_button}
						onClick={() => router.push("/signin")}
					>
						サインイン
					</button>
				)}
			</div>
		</div>
	);
}
