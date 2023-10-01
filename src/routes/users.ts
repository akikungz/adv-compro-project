import { Router } from "express";

import { prisma } from "../database";
import middleware from "../utils/middleware";

import { IRequestParams } from "../types/request";
import IResponse from "../types/response";
import { calcTotalPage } from "../utils/panigation";

const router = Router();

router.get("/:id/posts", middleware, async (req: IRequestParams<{ id: string }>, res: IResponse<any>) => {
    const { id } = req.params;
    const { page, limit } = req.query as { page: string, limit: string };

    const intPage = page ? parseInt(page) : 1;
    const intLimit = limit ? parseInt(limit) : 10;

    const skip = intLimit * (intPage - 1);
    const total = await prisma.post.count({
        where: {
            authorId: id
        }
    });

    const posts = await prisma.post.findMany({
        where: {
            authorId: id,
        },
        skip,
        take: intLimit,
        orderBy: {
            createdAt: "desc"
        }
    });

    return res.status(200).send({
        status: 200,
        message: "OK",
        data: {
            posts,
            pagination: {
                page: intPage,
                limit: intLimit,
                total,
                totalPage: calcTotalPage(total, intLimit)
            }
        }
    });
});

router.get("/:id/saved", middleware, async (req: IRequestParams<{ id: string }>, res: IResponse<any>) => {
    const { id } = req.params;
    const { page, limit } = req.query as { page: string, limit: string };

    const intPage = page ? parseInt(page) : 1;
    const intLimit = limit ? parseInt(limit) : 10;

    const skip = intLimit * (intPage - 1);
    const total = await prisma.savePost.count({
        where: {
            userId: id
        }
    });

    const savedPosts = await prisma.savePost.findMany({
        where: {
            userId: id
        },
        skip,
        take: intLimit,
        orderBy: {
            createdAt: "desc"
        },
        include: {
            post: {
                include: {
                    _count: {
                        select: {
                            children: true
                        }
                    },
                    author: true
                }
            }
        }
    });

    return res.status(200).send({
        status: 200,
        message: "OK",
        data: {
            posts: savedPosts.map((savedPost) => ({
                id: savedPost.post.id,
                content: savedPost.post.content,
                author: {
                    id: savedPost.post.author.id,
                    username: savedPost.post.author.username
                },
                children_count: savedPost.post._count.children,
                parent: savedPost.post.parentId,
                created_at: savedPost.post.createdAt,
                updated_at: savedPost.post.updatedAt,
            })),
            pagination: {
                page: intPage,
                limit: intLimit,
                total_data: total,
                total_page: calcTotalPage(total, intLimit)
            }
        }
    });
});

router.get("/:id", middleware, async (req: IRequestParams<{ id: string }>, res: IResponse<any>) => {
    const user = await prisma.user.findUnique({
        where: {
            id: req.params.id as string
        }
    });

    if (!user) {
        return res.status(404).send({
            status: 404,
            message: "[Not Found]: User not found",
            data: null
        });
    }

    return res.status(200).send({
        status: 200,
        message: "[OK]: Successfully get user",
        data: {
            id: user.id,
            username: user.username,
            created_at: user.createdAt,
        }
    });
});

export default router;