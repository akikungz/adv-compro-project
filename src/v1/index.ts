import { Router } from "express";

// Type
import type { Request, Response } from "express";
import IResponse from "../interface/IResponse";

const router = Router();

router.get("/", (req, res: Response<IResponse<string>>) => {
    res.status(200).send({
        status: 200,
        message: "Hello World!",
        data: "Hello World!"
    });
});

router.use("/auth", require("./auth").default);

router.get("/exit/:key", (req: Request<{ key: string }>, res: Response<IResponse<string>>) => {
    if (req.params.key == process.env.EXIT_KEY && process.env.NODE_ENV !== "production") {
        res.status(200).send({
            status: 200,
            message: "Goodbye World!",
            data: "Goodbye World!"
        });
        process.exit(0);
    } else {
        res.status(403).send({
            status: 403,
            message: "Forbidden",
            data: "Forbidden"
        });
    }
});

export default router;