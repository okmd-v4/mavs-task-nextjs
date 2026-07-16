export type SignupResponse = {
	success: boolean;
	data: { id: number; name: string; email: string } | null;
	message: string;
};
