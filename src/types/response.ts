import type { Response } from 'express';

type IResponse<T> = Response<{
    status: number;
    message: string;
    data: T;
}>;

export interface IPagination {
    page: number;
    limit: number;
    total_data: number;
    total_page: number;
}

export interface IPost {
    id: string;
    content: string;
    author: {
        id: string;
        username: string;
    };
    parent?: string;
    children_count: number;
    saved?: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface IPostWithChildren extends IPost {
    children: IPost[];
}

export default IResponse;