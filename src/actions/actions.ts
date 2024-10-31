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