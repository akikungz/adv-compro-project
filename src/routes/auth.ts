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
    username: string;
} | null>) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send({
            status: 400,
            message: "[Bad Request]: Missing [username] or [password] in request body",
            data: null
        });
    }

    const checkUser = await prisma.user.findUnique({ where: { username } });

    if (!checkUser) {
        return res.status(401).send({
            status: 401,
            message: "[Unauthorized]: Invalid username or password",
            data: null
        });
    }

    const checkPassword = await verifyPassword(password, checkUser.password);

    if (!checkPassword) {
        return res.status(401).send({
            status: 401,
            message: "[Unauthorized]: Invalid username or password",
            data: null
        });
    }

    const token = generateToken(checkUser.id);

    redis.set(token, checkUser.id, { EX: 60 * 60 * 24 * 30 });

    return res.status(200).send({
        status: 200,
        message: "[OK]: Successfully signed in",
        data: {
            token,
            id: checkUser.id,
            username: checkUser.username,
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
            message: "[Bad Request]: Missing [username], [password] or [email] in request body",
            data: null
        });
    }

    const checkUsername = await prisma.user.findUnique({ where: { username } });
    const checkEmail = await prisma.user.findUnique({ where: { email } });

    if (checkUsername || checkEmail) {
        return res.status(409).send({
            status: 409,
            message: "[Conflict]: Username or email already exists",
            data: null
        });
    }

    const hash = await hashPassword(password);

    const user = await prisma.user.create({ data: { username, password: hash, email } });

    if (!user) {
        return res.status(500).send({
            status: 500,
            message: `[Internal Server Error]: Failed to create user ${username}`,
            data: null
        });
    }

    return res.status(201).send({
        status: 201,
        message: `[Created]: Successfully created user ${username}`,
        data: user.id
    });
});

router.post("/signout", async (req: IRequestBody<{
    token: string
}>, res: IResponse<null>) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).send({
            status: 400,
            message: "[Bad Request]: Missing [token] in request body",
            data: null
        });
    }

    const checkToken = await redis.get(token);

    if (!checkToken) {
        return res.status(401).send({
            status: 401,
            message: "[Unauthorized]: Invalid token",
            data: null
        });
    }

    redis.del(token);

    return res.status(200).send({
        status: 200,
        message: "[OK]: Successfully signed out",
        data: null
    });
});

export default router;