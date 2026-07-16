"use client";
import { useEffect, useState } from "react";
import { User } from "@/app/types/User";
import { useUsers } from "@/app/hooks/useUsers";
import { useRequireAdmin } from "@/app/hooks/useRequireAdmin";
import { useLoginData } from "@/app/hooks/useLoginData";
import { ApiError } from "@/app/utils/ApiError";
import UserList from "@/app/components/UserList";
import styles from "./page.module.css";

export default function AdminUsers() {
	const { isRestored, isReady } = useRequireAdmin();
	const { loginData } = useLoginData();
	const { fetchUsers, deleteUser } = useUsers();
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

	const loadUsers = async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await fetchUsers();
			setUsers(data ?? []);
		} catch (err) {
			setError(
				err instanceof ApiError ? err.message : "ユーザー一覧の取得に失敗しました",
			);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (!isReady) return;
		loadUsers();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isReady]);

	const handleDeleteConfirm = async () => {
		if (deleteTargetId === null) return;
		try {
			await deleteUser(deleteTargetId);
			setDeleteTargetId(null);
			loadUsers();
		} catch (err) {
			setDeleteTargetId(null);
			setError(
				err instanceof ApiError ? err.message : "ユーザーの削除に失敗しました",
			);
		}
	};

	if (!isRestored) {
		return <p className="state-text">読み込み中...</p>;
	}
	if (!isReady) {
		return null;
	}

	return (
		<div>
			<h2>ユーザー管理</h2>
			<UserList
				users={users}
				loading={loading}
				error={error}
				currentUserEmail={loginData?.email}
				onDeleteRequest={(id) => setDeleteTargetId(id)}
			/>
			{deleteTargetId !== null && (
				<div className={styles.page_dialogOverlay}>
					<div className={styles.page_dialog}>
						<p>
							このユーザーを削除しますか？関連するメモも全て削除されます。
						</p>
						<div className={styles.page_dialogActions}>
							<button
								className={styles.page_dangerButton}
								onClick={handleDeleteConfirm}
							>
								削除する
							</button>
							<button onClick={() => setDeleteTargetId(null)}>
								キャンセル
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
