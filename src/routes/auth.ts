import { Router } from "express";

import { prisma, redis } from "../database";
import { hashPassword, verifyPassword } from "../utils/password";

import { IRequestBody } from "../types/request";
import IResponse from "../types/response";
import { generateToken } from "../utils/token";

const router = Router();

router.post("/signin", async (req: IRequestBody<{
    username: string;
    password: string;
}>, res: IResponse<{
    token: string;
    id: string;
} | null>) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send({
            status: 400,
            message: "Bad Request",
            data: null
        });
    }

    const checkUser = await prisma.user.findUnique({ where: { username } });

    if (!checkUser) {
        return res.status(401).send({
            status: 401,
            message: "Unauthorized",
            data: null
        });
    }

    const checkPassword = await verifyPassword(password, checkUser.password);

    if (!checkPassword) {
        return res.status(401).send({
            status: 401,
            message: "Unauthorized",
            data: null
        });
    }

    const token = generateToken(checkUser.id);

    redis.set(token, checkUser.id, { EX: 60 * 60 * 24 });

    return res.status(200).send({
        status: 200,
        message: "OK",
        data: {
            token,
            id: checkUser.id
        }
    });
});

router.post("/signup", async (req: IRequestBody<{
    username: string,
    password: string,
    email: string,
}>, res: IResponse<string>) => {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
        return res.status(400).send({
            status: 400,
            message: "Bad Request",
            data: null
        });
    }

    const checkUser = await prisma.user.findUnique({ where: { username } });

    if (checkUser) {
        return res.status(409).send({
            status: 409,
            message: "Conflict",
            data: null
        });
    }

    const hash = await hashPassword(password);

    const user = await prisma.user.create({ data: { username, password: hash, email } });

    if (!user) {
        return res.status(500).send({
            status: 500,
            message: "Internal Server Error",
            data: null
        });
    }

    return res.status(201).send({
        status: 201,
        message: "Created",
        data: user.id
    });
});

export default router;