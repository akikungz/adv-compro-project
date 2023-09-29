import express from 'express';
import cors from 'cors';

import path from 'path';
import fs from 'fs';

import { prisma, redis } from './database';

console.clear();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

fs.readdirSync(path.join(__dirname, 'routes'))
    .filter(file => file.endsWith(".js") || file.endsWith(".ts"))
    .map(async (file) => {
        app.use(`/api/${file.split('.')[0]}`, (await import(`./routes/${file}`)).default);
        console.log(`[ROUTES]: ${file} loaded`);
    });

async function bootstrap() {
    await prisma.$connect();
    console.log('[DATABASE]: Database connected');

    await redis.connect();

    app.listen(process.env.PORT, () => console.log(`[SERVER]: Server started on port ${process.env.PORT}`));
}

bootstrap();