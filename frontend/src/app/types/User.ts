export type User = {
	id: number;
	name: string;
	email: string;
	created_at: string;
};

export type UserListResponse = {
	success: boolean;
	data: User[];
	message: string;
};
