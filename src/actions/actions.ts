"use server";

import prisma from "@/lib/db";

export async function fetchUsers() {
  const user = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      image: true,
      name: true,
    },
  });

  if (!user) {
    throw new Error("Subjects not found.");
  }

  return user;
}
