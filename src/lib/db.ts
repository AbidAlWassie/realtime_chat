// src/lib/db.ts
import { PrismaClient } from "@prisma/client";

// Declare a global variable to store PrismaClient instance
declare global {
  var prismaGlobal: PrismaClient | undefined;
}

// Create a new PrismaClient instance if not already defined globally
const prisma = global.prismaGlobal || new PrismaClient();

// Assign the PrismaClient instance to the global variable in development
if (process.env.NODE_ENV !== "production") {
  global.prismaGlobal = prisma;
}

export default prisma;
