import { PrismaClient } from "@prisma/client";

declare global {
  // Allow global `prismaGlobal` in NodeJS global scope
  namespace NodeJS {
    interface Global {
      prismaGlobal: PrismaClient | undefined;
    }
  }
}

export {};
