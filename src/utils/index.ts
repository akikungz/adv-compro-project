import { hash, argon2id } from 'argon2';
import jwt from 'jsonwebtoken';

import type { Request, Response, NextFunction } from 'express';
import prisma from '../database';

export const hashPassword = async (password: string) => await hash(password, { type: argon2id });

export const genAccessToken = (id: string, username: string, email: string) => jwt.sign(
    { id, username, email },
    process.env.SECRET_KEY || "No, Horny",
    { expiresIn: "30d" }
);

export const checkAccessToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).send({
            status: 401,
            message: "Unauthorized",
            data: null
        });
    }

    jwt.verify(token, process.env.SECRET_KEY || "No, Horny", 
        async (err, user: unknown) => {
            if (err) {
                if (err.name === "TokenExpiredError") {
                    await prisma.token.deleteMany({
                        where: {
                            token
                        }
                    });
                }

                return res.status(403).send({
                    status: 403,
                    message: "Forbidden",
                    data: null
                });
            }

            const validateToken = await prisma.token.findFirst({
                where: {
                    token,
                    userId: (user as { id: string }).id
                }
            });

            if (!validateToken) {
                return res.status(401).send({
                    status: 401,
                    message: "Unauthorized",
                    data: null
                });
            }

            next();
        }
    );
}