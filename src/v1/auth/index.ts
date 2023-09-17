import { Router } from "express";
import { verify } from "argon2";

// Type
import type { Request, Response } from "express";
import IResponse from "../../interface/IResponse";
import { LoginReturn } from "../../interface/IUsers";

// Database
import prisma from "../../database";

// Utils
import { checkAccessToken, genAccessToken, hashPassword as hashFunc } from "../../utils";

const router = Router();

router.post("/login", 
    async (
        req: Request< { username: string, password: string } >,
        res: Response<IResponse<LoginReturn | null>>
    ) => {
        const { username, password } = req.body;

        try {
            const user = await prisma.user.findFirst({
                where: {
                    username
                }
            });
    
            if (user && await verify(user.password, password)) {
                const genToken = genAccessToken(user.id, user.username, user.email);

                await prisma.token.create({
                    data: {
                        token: genToken,
                        userId: user.id
                    }
                });

                res.status(200).send({
                    status: 200,
                    message: "Login success",
                    data: {
                        token: genToken
                    }
                });
            } else {
                res.status(404).send({
                    status: 404,
                    message: "User not found",
                    data: null
                });
            }
        } catch (err) {
            res.status(500).send({
                status: 500,
                message: "Internal Server Error",
                data: null
            });
        }
    }
);

router.post("/register", async (req: Request<
    { username: string, password: string, email: string }
>, res: Response<IResponse<boolean>>) => {
    const { username, password, email } = req.body;
    const hashPassword = await hashFunc(password);

    const user = await prisma.user.create({
        data: {
            username,
            password: hashPassword,
            email
        }
    });

    if (user) {
        res.status(200).send({
            status: 200,
            message: "Register success",
            data: true
        });
    } else {
        res.status(500).send({
            status: 500,
            message: "Internal Server Error",
            data: false
        });
    }
});

router.use(checkAccessToken);

router.get("/:id", async (req: Request, res: Response<IResponse<unknown>>) => {
    const userToken = await prisma.token.findFirst({
        where: {
            token: req.headers["authorization"]?.split(" ")[1]
        }
    });

    const user = await prisma.user.findFirst({
        where: {
            id: userToken?.userId
        }
    });

    if (user) {
        res.status(200).send({
            status: 200,
            message: "Success",
            data: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } else {
        res.status(404).send({
            status: 404,
            message: "User not found",
            data: null
        });
    }
});

export default router;