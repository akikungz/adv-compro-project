import { Router } from 'express';

import { prisma } from '../database';
import middleware from '../utils/middleware';
import { calcSkip, calcTotalPage } from '../utils/panigation';

import { IRequestBody } from '../types/request';
import IResponse from '../types/response';
import { getIdFromToken } from '../utils/token';

const router = Router();

router.get('/', middleware, async (req, res: IResponse<any>) => {
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

    const prePost = await prisma.post.findMany({
        skip,
        take: intLimit,
        orderBy: {
            createdAt: 'desc'
        },
        include: { 
            author: true,
            _count: {
                select: { 
                    children: true
                }
            },
        },
    });

    const ePost = prePost.map(async (post) => {
        const saved = await prisma.savePost.findFirst({
            where: {
                postId: post.id,
                userId: getIdFromToken(req.headers.authorization as string).id
            }
        });

        return {
            ...post,
            saved: saved ? true : false
        }
    })

    const posts = await Promise.all(ePost);

    try {
        res.status(200).send({
            status: 200,
            message: 'OK',
            data: {
                posts: posts.map((post) => ({
                    id: post.id,
                    content: post.content,
                    author: {
                        id: post.author.id,
                        username: post.author.username
                    },
                    parent: post.parentId,
                    saved: post.saved,
                    children_count: post._count.children,
                    created_at: post.createdAt,
                    updated_at: post.updatedAt
                })),
                pagination: {
                    page: intPage,
                    limit: intLimit,
                    total_data: total,
                    total_page: totalPage
                }
            }
        });
    } catch (err) {
        res.status(500).send({
            status: 500,
            message: '[Internal Server Error]: Failed to get posts',
            data: null
        });
    }
});

router.post('/', middleware, async (req: IRequestBody<{ content: string, user: string }>, res: IResponse<any>) => {
    const { content } = req.body;

    const user = getIdFromToken(req.headers.authorization as string).id;

    if (!content) {
        return res.status(400).send({
            status: 400,
            message: '[Bad Request]: Missing [content] in request body',
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
        },
        include: {
            author: true
        }
    });

    return res.status(201).send({
        status: 201,
        message: `[Created]: Successfully created post [${post.id}]`,
        data: {
            id: post.id,
            content: post.content,
            author: {
                id: post.author.id,
                username: post.author.username
            },
            created_at: post.createdAt,
            updated_at: post.updatedAt
        }
    });
});

router.get('/:id', middleware, async (req, res: IResponse<any>) => {
    const { id } = req.params;

    const post = await prisma.post.findFirst({ 
        where: { id }, 
        include: {
            author: true,
            children: {
                include: {
                    author: true,
                    _count: {
                        select: {
                            children: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
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

    const saved = await prisma.savePost.findFirst({
        where: {
            postId: id,
            userId: getIdFromToken(req.headers.authorization as string).id
        }
    });

    const ePost = post.children.map(async (child) => {
        const saved = await prisma.savePost.findFirst({
            where: {
                postId: child.id,
                userId: getIdFromToken(req.headers.authorization as string).id
            }
        });

        return {
            ...child,
            saved: saved ? true : false
        }
    })

    const children = await Promise.all(ePost);

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
            parent: post.parentId,
            children: children.map(child => ({
                id: child.id,
                content: child.content,
                author: {
                    id: child.author.id,
                    username: child.author.username
                },
                saved: child.saved,
                children_count: child._count.children,
                created_at: child.createdAt,
                updated_at: child.updatedAt
            })),
            children_count: post.children.length,
            saved: saved ? true : false,
            created_at: post.createdAt,
            updated_at: post.updatedAt
        }
    });
});

router.post('/:id', middleware, async (req: IRequestBody<{ content: string, user: string }>, res: IResponse<any>) => {
    const { id } = req.params as { id: string };
    const { content } = req.body;

    const user = getIdFromToken(req.headers.authorization as string).id;

    if (!content) {
        return res.status(400).send({
            status: 400,
            message: '[Bad Request]: Missing [content] in request body',
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
        },
        include: {
            author: true
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
            message: `[Created]: Successfully created post [${post.id}]`,
            data: {
                id: post.id,
                content: post.content,
                author: {
                    id: post.author.id,
                    username: post.author.username
                },
                created_at: post.createdAt,
                updated_at: post.updatedAt
            }
        });
    } else {
        return res.status(400).send({
            status: 400,
            message: '[Bad Request]: Failed to create post',
            data: null
        });
    }
});

router.patch('/:id', middleware, async (req, res: IResponse<any>) => {
    const { id } = req.params as { id: string };

    const user = getIdFromToken(req.headers.authorization as string).id;

    const checkData = await prisma.savePost.findFirst({
        where: {
            postId: id,
            userId: user
        }
    });

    if (!checkData) {
        const savePost = await prisma.savePost.create({
            data: {
                postId: id,
                userId: user
            }
        });

        return res.status(201).send({
            status: 201,
            message: `[Created]: Successfully saved post [${id}]`,
            data: savePost.id
        });
    } else {
        await prisma.savePost.delete({
            where: {
                id: checkData.id
            }
        });

        return res.status(200).send({
            status: 200,
            message: `[OK]: Successfully unsaved post [${id}]`,
            data: null
        });
    }
});

export default router;