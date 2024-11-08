"use server";

import prisma from "@/lib/db";
import { revalidatePath, revalidateTag } from "next/cache";

export async function fetchUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      image: true,
      name: true,
    },
  });

  if (!users) {
    throw new Error("No users found.");
  }

  return users;
}

export async function fetchRooms() {
  const rooms = await prisma.room.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      adminId: true,
    },
    orderBy: {
      createdAt: "desc",
    }
  });

  if (!rooms) {
    throw new Error("No rooms found.");
  }

  return rooms;
}

export async function createRoom(roomName: string, description: string, adminId: string) {
  if (!roomName || roomName.trim() === '') {
    throw new Error("Room name is required and cannot be empty.");
  }

  const room = await prisma.room.create({
    data: {
      name: roomName.trim(),
      description: description ? description.trim() : null,
      image: null,
      adminId,
    },
  });

  revalidateTag('rooms');
  return room;
}

export async function editRoom(roomId: string, name: string, description: string) {
  if (!roomId) {
    throw new Error("Room ID is required.");
  }

  if (!name || name.trim() === '') {
    throw new Error("Room name is required and cannot be empty.");
  }

  try {
    const updatedRoom = await prisma.room.update({
      where: {
        id: roomId,
      },
      data: {
        name: name.trim(),
        description: description ? description.trim() : null,
      },
    });

    revalidateTag('rooms');
    revalidatePath(`/rooms/${roomId}`);

    return { success: true, room: updatedRoom };
  } catch (error) {
    console.error('Failed to update room:', error);
    return { success: false, error: 'Failed to update room. Please try again.' };
  }
}

export async function deleteRoom(roomId: string) {
  if (!roomId) {
    throw new Error("Room ID is required.");
  }

  try {
    await prisma.room.delete({
      where: { id: roomId },
    });

    revalidateTag('rooms');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Failed to delete room:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete room. Please try again.' };
  }
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
      content: message.trim(),
      userId: user.id,
      roomId,
    },
  });

  revalidateTag(`room-messages-${roomId}`);

  return savedMessage;
}

export async function fetchMessages(roomId: string) {
  if (!roomId) {
    throw new Error("Room ID is required.");
  }

  const messages = await prisma.message.findMany({
    where: { roomId },
    include: {
      user: { select: { name: true, createdAt: true, id: true } }, // Include user name for each message
    },
    orderBy: { createdAt: "asc" },
  });

  return messages.map(message => ({
    id: message.id,
    content: message.content,
    createdAt: message.createdAt,
    senderName: message.user.name,
    senderId: message.userId,
  }));
}