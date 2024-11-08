"use server";

import prisma from "@/lib/db";
import { revalidateTag } from "next/cache";


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
    throw new Error("Users not found.");
  }

  return user;
}

export async function fetchRooms() {
  const roomName = await prisma.room.findMany({
    select: {
      id: true,
      name: true,
      description: true,
    },
    orderBy: {
      createdAt: "asc"
    }
  });

  if (!roomName) {
    throw new Error("Room not found.");
  }

  return roomName;
}


export async function createRoom(roomName: string, description: string) {
  if (!roomName) {
    throw new Error("Room name is required.");
  }

  const room = await prisma.room.create({
    data: {
      name: roomName,
      description: description,
      image: null,
    },
  });

  return room;
}

export async function storeMessage(
  message: string,
  senderId: string,
  senderName: string,
  roomId: string
) {
  if (!message) throw new Error("Message content is required.");

  let user = await prisma.user.findUnique({
    where: { email: senderId },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: senderId,
        name: senderName,
      },
    });
  }

  const savedMessage = await prisma.message.create({
    data: {
      content: message,
      userId: user.id,
      roomId,
    },
  });

  // Trigger revalidation only once per message sent
  revalidateTag(`room-messages-${roomId}`);

  return savedMessage;
}


// create another server action to fetch & revalidate every time a new message gets sent

export async function fetchMessages(roomId: string) {
  if (!roomId) {
    throw new Error("Room ID is required.");
  }

  const messages = await prisma.message.findMany({
    where: { roomId },
    include: {
      user: { select: { name: true, createdAt: true, id: true } }, // Include user name for each message
    },
    orderBy: { createdAt: "asc" }, // Order messages by creation time
  });


  return messages.map(message => ({
    id: message.id,
    content: message.content,
    createdAt: message.createdAt,
    senderName: message.user.name,
    senderId: message.userId,
  }));
}