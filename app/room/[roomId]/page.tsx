import { PageProps } from "../../../app/page";
import SessionProvider from "../../../components/SessionProvider";
import prisma from "../../../lib/db";
import RoomUI from "./roomUI";

export default async function RoomPage({ params, searchParams }: PageProps) {
  const { roomId } = await params;
  await searchParams;

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
      <SessionProvider>
        <RoomUI roomId={roomId} />
      </SessionProvider>
    </div>
  );
}

