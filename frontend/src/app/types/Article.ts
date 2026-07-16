export type Article = {
	id: number;
	title: string;
	content: string;
	author_id: number;
	created_at: string;
	updated_at: string;
};

export type ArticleListResponse = {
	success: boolean;
	data: Article[];
	message: string;
};

export type ArticleResponse = {
	success: boolean;
	data: Article;
	message: string;
};
