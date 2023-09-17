import express from 'express';

// Type
import type { Response } from 'express';
import IResponse from './interface/IResponse';

// Router
import v1Router from './v1';

// Database
import prisma from './database';

const app = express();
console.clear();

async function bootstrap() {
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        next();
    })

    app.use("/v1", v1Router);

    app.use((req, res: Response<IResponse<null>>) => {
        res.send({
            status: 404,
            message: "Not Found",
            data: null
        })
    });

    app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
}

bootstrap()
    .then(() => prisma.$connect())
    .then(() => console.log(`Exit key: ${process.env.EXIT_KEY}`))
    .catch(console.error)
    .finally(() => prisma.$disconnect());