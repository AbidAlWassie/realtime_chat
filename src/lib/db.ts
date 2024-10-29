// src/lib/db.ts
import { PrismaClient } from "@prisma/client";

interface GlobalPrisma {
  prismaGlobal?: PrismaClient;
}

const globalWithPrisma = global as typeof globalThis & GlobalPrisma;
const prisma = globalWithPrisma.prismaGlobal || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  (global as typeof globalThis & GlobalPrisma).prismaGlobal = prisma;
}

export default prisma;
