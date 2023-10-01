export interface Post {
    id: string;
    content: string;
    author: {
        id: string;
        username: string;
    };
    parent: string | null;
    children: Post[];
    children_count: number;
    saved: boolean;
    created_at: string;
    updated_at: string;
}

export interface Pagination {
    page: number;
    limit: number;
    total_data: number;
    total_page: number;
}

export interface PostIndex {
    posts: Post[];
    pagination: Pagination;
}

export interface Response<T> {
    status: number;
    message: string;
    data: T;
}