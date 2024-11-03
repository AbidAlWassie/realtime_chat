// src/app/room/[roomId]/page.tsx
import SessionProvider from "@/components/SessionProvider";
import prisma from "@/lib/db";
import RoomUI from "./roomUI";

interface RoomPageProps {
  params: { roomId: string };
}

export default async function RoomPage({ params }: RoomPageProps) {
  const { roomId } = params;
  
  const room = await prisma.room.findUnique({
    where: { id: roomId },
  });

  if (!room) {
    return (
      <div className="bg-gray-900 min-h-screen text-white">
        <h1 className="text-2xl font-bold mb-4">Room not found</h1>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      {/* <h1 className="text-2xl font-bold mb-4">Room: {roomId}</h1> */}
      <SessionProvider>
        <RoomUI roomId={roomId} />
      </SessionProvider>
    </div>
  );
}
