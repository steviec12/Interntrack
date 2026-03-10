import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
    // In local dev, use the direct raw URL if accelerating URL fails
    const rawUrl = process.env.DATABASE_URL?.replace("prisma+postgres://", "postgresql://").replace("/?api_key", "/template1?api_key") || "";
    // strip everything after template1 if it's the local dev DB
    const connectionString = rawUrl.includes("localhost:51213")
        ? "postgresql://postgres:postgres@localhost:51214/template1"
        : process.env.DATABASE_URL;

    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
};

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
