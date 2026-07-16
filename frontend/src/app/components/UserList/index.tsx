"use client";
import { User } from "@/app/types/User";
import styles from "./userList.module.css";

type Props = {
	users: User[];
	loading: boolean;
	error: string | null;
	currentUserEmail?: string;
	onDeleteRequest: (id: number) => void;
};

export default function UserList({
	users,
	loading,
	error,
	currentUserEmail,
	onDeleteRequest,
}: Props) {
	if (loading) {
		return <p className={styles.userList_state}>読み込み中...</p>;
	}

	if (error) {
		return <p className={styles.userList_stateError}>{error}</p>;
	}

	if (!users.length) {
		return (
			<p className={styles.userList_state}>登録されたユーザーがいません</p>
		);
	}

	return (
		<table className={styles.userList_table}>
			<thead>
				<tr>
					<th>ID</th>
					<th>ユーザー名</th>
					<th>メールアドレス</th>
					<th>登録日時</th>
					<th />
				</tr>
			</thead>
			<tbody>
				{users.map((user) => (
					<tr key={user.id}>
						<td>{user.id}</td>
						<td>{user.name}</td>
						<td>{user.email}</td>
						<td>{new Date(user.created_at).toLocaleString("ja-JP")}</td>
						<td>
							{user.email !== currentUserEmail && (
								<button
									className={styles.userList_deleteButton}
									onClick={() => onDeleteRequest(user.id)}
								>
									削除
								</button>
							)}
						</td>
					</tr>
				))}
			</tbody>
		</table>
	);
}
