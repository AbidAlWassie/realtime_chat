// pages/api/messages/create.ts
import prisma from "@/lib/db";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const session = await getSession({ req }) as { user: { id: string } } | null;
  if (!session || !session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { content } = req.body;

  try {
    const message = await prisma.message.create({
      data: {
        content,
        userId: session.user.id,
      },
    });
    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating message" });
  }
}