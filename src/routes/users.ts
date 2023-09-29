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

router.get("/:id/likes", middleware, async (req: IRequestParams<{ id: string }>, res: IResponse<any>) => {
    const { id } = req.params;
    const { page, limit } = req.query as { page: string, limit: string };

    const intPage = page ? parseInt(page) : 1;
    const intLimit = limit ? parseInt(limit) : 10;

    const skip = intLimit * (intPage - 1);
    const total = await prisma.likePost.count({
        where: {
            userId: id,
            active: true
        }
    });

    const likes = await prisma.likePost.findMany({
        where: {
            userId: id,
            active: true
        },
        skip,
        take: intLimit,
        orderBy: {
            createdAt: "desc"
        },
        include: {
            post: true
        }
    });

    return res.status(200).send({
        status: 200,
        message: "OK",
        data: {
            likes,
            pagination: {
                page: intPage,
                limit: intLimit,
                total,
                totalPage: calcTotalPage(total, intLimit)
            }
        }
    });
});

router.get("/:id/shares", middleware, async (req: IRequestParams<{ id: string }>, res: IResponse<any>) => {
    const { id } = req.params;
    const { page, limit } = req.query as { page: string, limit: string };

    const intPage = page ? parseInt(page) : 1;
    const intLimit = limit ? parseInt(limit) : 10;

    const skip = intLimit * (intPage - 1);
    const total = await prisma.sharePost.count({
        where: {
            userId: id,
            active: true
        }
    });

    const shares = await prisma.sharePost.findMany({
        where: {
            userId: id,
            active: true
        },
        skip,
        take: intLimit,
        orderBy: {
            createdAt: "desc"
        },
        include: {
            post: true
        }
    });

    return res.status(200).send({
        status: 200,
        message: "OK",
        data: {
            shares,
            pagination: {
                page: intPage,
                limit: intLimit,
                total,
                totalPage: calcTotalPage(total, intLimit)
            }
        }
    });
});

export default router;