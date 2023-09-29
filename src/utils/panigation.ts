export const calcSkip = (page: number, limit: number) => (page - 1) * limit;

export const calcTotalPage = (total: number, limit: number) => Math.ceil(total / limit);