import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';

const prisma = new PrismaClient();

const redis = createClient({ url: process.env.REDIS_URL });

redis.on('connect', () => console.log('[REDIS]: Redis connected'));

export { prisma, redis }