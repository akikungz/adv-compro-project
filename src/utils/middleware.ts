import { NextFunction } from "express";
import { verify } from "jsonwebtoken";

import { redis } from "../database"

import IResponse from "../types/response";

export default (req, res: IResponse<null>, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).send({
            status: 401,
            message: "Unauthorized 1",
            data: null
        })
    }

    verify(token, process.env.JWT_SECRET!, async (err, decoded) => {
        if (err) {
            return res.status(401).send({
                status: 401,
                message: "Unauthorized 2",
                data: null
            })
        }

        const userId = (decoded as unknown as { id: string }).id;

        const result = await redis.get(token);

        if (result !== userId) {
            return res.status(401).send({
                status: 401,
                message: "Unauthorized 3",
                data: null
            })
        }
    });

    next();
}