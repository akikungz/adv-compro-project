import type { Request } from "express";

type IRequestBody<T> = Request<{}, {}, T>;

type IRequestParams<T> = Request<T, {}, {}>;

type IRequestQuery<T> = Request<{}, T, {}>;

export { IRequestBody, IRequestParams, IRequestQuery };