import { Router } from 'express';

import { prisma, redis } from '../database';
import middleware from '../utils/middleware';
import { calcSkip, calcTotalPage } from '../utils/panigation';

import { IRequestBody, IRequestQuery } from '../types/request';
import IResponse from '../types/response';

const router = Router();

router.get('/', async (req, res: IResponse<any>) => {
    const { page, limit } = req.query as { page: string, limit: string };

    const intPage = page ? parseInt(page) : 1;
    const intLimit = limit ? parseInt(limit) : 10;

    const skip = calcSkip(intPage, intLimit);
    const total = await prisma.post.count();
    const totalPage = calcTotalPage(total, intLimit);

    if (intPage > totalPage) return res.status(404).send({
        status: 404,
        message: 'Not Found',
        data: null
    });

    const posts = await prisma.post.findMany({
        skip,
        take: intLimit,
        orderBy: {
            createdAt: 'desc'
        },
        include: { 
            author: true,
            likes: true,
            shares: true,
            children: true
        }
    });

    return res.status(200).send({
        status: 200,
        message: 'OK',
        data: {
            posts: posts.map(post => ({
                id: post.id,
                content: post.content,
                author: {
                    id: post.author.id,
                    username: post.author.username
                },
                createdAt: post.createdAt,
                updatedAt: post.updatedAt
            })),
            pagination: {
                page: intPage,
                limit: intLimit,
                total,
                totalPage
            }
        }
    });
});

router.post('/', middleware, async (req: IRequestBody<{ content: string, user: string }>, res: IResponse<any>) => {
    const { content, user } = req.body;

    if (!content) {
        return res.status(400).send({
            status: 400,
            message: 'Bad Request',
            data: null
        });
    }

    const post = await prisma.post.create({
        data: {
            content,
            author: {
                connect: {
                    id: user
                }
            }
        }
    });

    return res.status(201).send({
        status: 201,
        message: 'Created',
        data: {
            id: post.id,
            content: post.content,
        }
    });
});

router.get('/:id', middleware, async (req, res: IResponse<any>) => {
    const { id } = req.params;

    const post = await prisma.post.findFirst({ 
        where: { id }, 
        include: {
            author: true,
            likes: true,
            shares: true,
            children: {
                include: {
                    author: true
                }
            }
        } 
    });

    if (!post) {
        return res.status(404).send({
            status: 404,
            message: 'Not Found',
            data: null
        });
    }
    return res.status(200).send({
        status: 200,
        message: 'OK',
        data: {
            id: post.id,
            content: post.content,
            author: {
                id: post.author.id,
                username: post.author.username
            },
            count: {
                likes: post.likes.length,
                shares: post.shares.length,
                comments: post.children.length
            },
            parent: post.parentId,
            children: post.children.map(child => ({
                id: child.id,
                content: child.content,
                user: {
                    id: child.author.id,
                    username: child.author.username
                }
            })),
            createdAt: post.createdAt,
            updatedAt: post.updatedAt
        }
    });
});

router.post('/:id', middleware, async (req: IRequestBody<{ content: string, user: string }>, res: IResponse<any>) => {
    const { id } = req.params as { id: string };
    const { content, user } = req.body;

    if (!content) {
        return res.status(400).send({
            status: 400,
            message: 'Bad Request',
            data: null
        });
    }

    const post = await prisma.post.create({
        data: {
            content,
            parent: {
                connect: {
                    id
                }
            },
            author: {
                connect: {
                    id: user
                }
            }
        }
    });

    if (post) {
        await prisma.post.update({
            where: {
                id
            },
            data: {
                children: {
                    connect: {
                        id: post.id
                    }
                }
            }
        });
        
        return res.status(201).send({
            status: 201,
            message: 'Created',
            data: {
                id: post.id,
                content: post.content,
            }
        });
    } else {
        return res.status(400).send({
            status: 400,
            message: 'Bad Request',
            data: null
        });
    }
});

router.patch('/:id/like', middleware, async (req, res: IResponse<any>) => {
    const { id } = req.params as { id: string };
    const { user } = req.body as { user: string };

    const liked = await prisma.likePost.findFirst({
        where: {
            postId: id,
            userId: user
        }
    });

    if (liked) {
        await prisma.likePost.update({
            where: {
                id: liked.id
            },
            data: {
                active: !liked.active
            }
        });
    } else {
        await prisma.likePost.create({
            data: {
                post: {
                    connect: {
                        id
                    }
                },
                user: {
                    connect: {
                        id: user
                    }
                }
            }
        });
    }

    return res.status(200).send({
        status: 200,
        message: 'OK',
        data: {
            liked: !liked?.active,
            post: id
        }
    });
});

router.patch('/:id/share', middleware, async (req, res: IResponse<any>) => {
    const { id } = req.params as { id: string };
    const { user } = req.body as { user: string };

    const shared = await prisma.sharePost.findFirst({
        where: {
            postId: id,
            userId: user
        }
    });

    if (shared) {
        await prisma.sharePost.update({
            where: {
                id: shared.id
            },
            data: {
                active: !shared.active
            }
        });
    } else {
        await prisma.sharePost.create({
            data: {
                post: {
                    connect: {
                        id
                    }
                },
                user: {
                    connect: {
                        id: user
                    }
                }
            }
        });
    }

    return res.status(200).send({
        status: 200,
        message: 'OK',
        data: {
            shared: !shared?.active,
            post: id
        }
    });
});

export default router;