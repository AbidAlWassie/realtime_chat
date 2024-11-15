import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import { useState } from 'react';

interface Room {
  id: string;
  name: string;
  description: string;
}

export function ChatRoomsList({ rooms }: { rooms: Room[] }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingRoomId, setLoadingRoomId] = useState<string | null>(null)

  const handleRoomClick = (roomId: string) => {
    setIsLoading(true)
    setLoadingRoomId(roomId)
    router.push(`/room/${roomId}`)
  }

  return (
    <ScrollArea className="h-[64vh]">
      {rooms.map((room) => (
        <div
          key={room.id}
          onClick={() => handleRoomClick(room.id)}
          className="flex items-center space-x-4 mb-4 p-4 hover:bg-slate-700 rounded-lg cursor-pointer"
        >
          <Avatar>
            <AvatarImage src={``} alt={room.name} />
            <AvatarFallback className="bg-gray-600">{room.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-grow">
            <h3 className="font-semibold">{room.name}</h3>
            <p className="text-sm text-slate-400">
              {room.description}
            </p>
          </div>
          {isLoading && loadingRoomId === room.id && (
            <p className="text-sm text-blue-400">Loading...</p>
          )}
        </div>
      ))}
      {rooms.length === 0 && <p className="text-center">No rooms available</p>}
    </ScrollArea>
  )
}