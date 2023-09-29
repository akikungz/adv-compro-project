import type { Response } from 'express';

type IResponse<T> = Response<{
    status: number;
    message: string;
    data: T;
}>;

export default IResponse;