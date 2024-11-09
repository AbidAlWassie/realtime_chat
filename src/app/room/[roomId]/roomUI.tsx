// src/app/room/[roomId]/roomUI.tsx
"use client";

import { deleteRoom, editRoom, fetchMessages, fetchRooms, storeMessage } from "@/actions/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ArrowLeft, MoreVertical, Phone, Send, Video } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";
import EditRoomDialog from "./editRoom";

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  room: string;
  createdAt: string;
}

const serverAddress = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL;

interface RoomUIProps {
  roomId: string;
}

export default function RoomUI({ roomId }: RoomUIProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [roomName, setRoomName] = useState("Loading...");
  const [roomDescription, setRoomDescription] = useState("");
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);
  const prevMessageCount = useRef(messages.length);

  const loadMessages = useCallback(async () => {
    const initialMessages = await fetchMessages(roomId);
    const formattedMessages = initialMessages.map(msg => ({
      ...msg,
      senderId: msg.senderName || "unknown",
      senderName: msg.senderId === session?.user?.id ? "You" : (msg.senderName || "unknown"),
      room: roomId,
      createdAt: new Date(msg.createdAt).toISOString(),
    }));
    setMessages(formattedMessages);
  }, [roomId, session?.user?.id]);

  const sendMessage = async () => {
    if (message.trim() && socketRef.current) {
      const senderId = session?.user?.email || "anonymous";
      const senderName = session?.user?.name || "Anonymous";
      const newMessage = {
        content: message,
        senderId,
        senderName,
        room: roomId,
        createdAt: new Date().toISOString(),
      };
      socketRef.current.emit("send_message", newMessage);
      const savedMessage = await storeMessage(message, senderId, senderName, roomId);
      const formattedMessage: Message = {
        id: savedMessage.id,
        content: savedMessage.content,
        senderId: savedMessage.userId,
        senderName: "You",
        room: roomId,
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, formattedMessage]);
      setMessage("");
      socketRef.current.emit("typing", { room: roomId, user: session?.user?.name, isTyping: false });
    }
  };

  useEffect(() => {
    loadMessages();
    fetchRooms().then(rooms => {
      const room = rooms.find(r => r.id === roomId) as { id: string; name: string; description: string; adminId: string } | undefined;
      if (room) {
        setRoomName(room.name || "Unknown Room");
        setIsAdmin(room.adminId === session?.user?.id);
        setRoomDescription(room.description || "");
        console.log("adminId ", room.adminId, "session ", session?.user?.id);
      }
    });

    if (!socketRef.current) {
      socketRef.current = io(serverAddress, { transports: ["websocket"] });
      console.log("Socket connected");
    }

    const socket = socketRef.current;

    socket.emit("join_room", roomId);
    setActiveUsers(prev => Array.from(new Set([...prev, session?.user?.name || 'Anonymous'])));
    
    socket.on("receive_message", (data: Message) => {
      if (data.senderName !== session?.user?.name) {
        setMessages(prev => [...prev, data]);
      }
    });

    socket.on("user_typing", (data: { user: string; isTyping: boolean }) => {
      setTypingUsers(prev => 
        data.isTyping
          ? Array.from(new Set([...prev, data.user]))
          : prev.filter(user => user !== data.user)
      );
    });

    socket.on("user_joined", (data: { user: string }) => {
      setActiveUsers(prev => Array.from(new Set([...prev, data.user])));
    });

    socket.on("user_left", (data: { user: string }) => {
      setActiveUsers(prev => prev.filter(user => user !== data.user));
    });

    return () => {
      socket.off("receive_message");
      socket.off("user_typing");
      socket.off("user_joined");
      socket.off("user_left");
      socket.disconnect();
      setActiveUsers(prev => prev.filter(user => user !== session?.user?.name));
      socketRef.current = null;
    };
  }, [roomId, session, loadMessages]);

  useEffect(() => {
    if (messages.length > prevMessageCount.current) {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    
    prevMessageCount.current = messages.length;
  }, [messages]);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderMessages = () => {
    let lastDate: Date | null = null;
    return messages.map((msg) => {
      const messageDate = new Date(msg.createdAt);
      let showTimestamp = false;

      if (!lastDate || messageDate.getTime() - lastDate.getTime() >= 60 * 60 * 1000) {
        showTimestamp = true;
        lastDate = messageDate;
      }

      return (
        <div key={msg.id}>
          {showTimestamp && (
            <div className="text-center text-sm text-gray-500 my-2">
              {formatDate(messageDate)}
            </div>
          )}
          <div className={`flex ${msg.senderName === "You" ? "justify-end" : "justify-start"}`}>
            <div
              className={`p-3 rounded-lg max-w-[70%] min-w-[80px] ${
                msg.senderName === "You" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-700 text-gray-200"
              }`}
            >
              <p className="font-semibold">{msg.senderName}</p>
              <p>{msg.content}</p>
            </div>
          </div>
        </div>
      );
    });
  };

  const handleUpdateRoom = async (name: string, description: string) => {
    const result = await editRoom(roomId, name, description);
    if (result.success) {
      setRoomName(name);
      setRoomDescription(description);
    } else {
      console.error("Failed to update room:", result.error);
    }
  };

  const handleDeleteRoom = async () => {
    try {
      const result = await deleteRoom(roomId);
      if (result.success) {
        console.log("Room deleted successfully");
        router.push('/'); // Redirect to home page after deletion
      } else {
        console.error("Failed to delete room:", result.error);
      }
    } catch (error) {
      console.error("Error deleting room:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen min-h-[100svh] bg-gray-900 text-white">
      <header className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <Link href="/" passHref>
            <Button variant="ghost" size="icon" className="text-blue-400 hover:text-blue-300">
              <ArrowLeft className="h-6 w-6" />
              <span className="sr-only">Back to Rooms</span>
            </Button>
          </Link>
          <Avatar>
            <AvatarImage src="" alt="Room Avatar" />
            <AvatarFallback className="bg-gray-600">{roomName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold truncate-10 w-32 overflow-hidden text-ellipsis whitespace-nowrap">{roomName}</h1>
            <p className="text-sm text-gray-400 truncate-10 w-32 overflow-hidden text-ellipsis whitespace-nowrap">
              {activeUsers.length} user{activeUsers.length !== 1 ? 's' : ''} active
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="text-blue-400 hover:text-blue-300">
            <Phone className="h-5 w-5" />
            <span className="sr-only">Call</span>
          </Button>
          <Button variant="ghost" size="icon" className="text-blue-400 hover:text-blue-300">
            <Video className="h-5 w-5" />
            <span className="sr-only">Video Call</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-blue-400 hover:text-blue-300">
                <MoreVertical className="h-5 w-5" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
              {isAdmin && (
                <DropdownMenuItem asChild>
                  <EditRoomDialog
                    roomId={roomId}
                    initialName={roomName}
                    initialDescription={roomDescription}
                    onUpdate={handleUpdateRoom}
                    onDelete={handleDeleteRoom}
                  />
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="text-gray-200 focus:bg-gray-700">Mute Notifications</DropdownMenuItem>
              <DropdownMenuItem className="text-gray-200 focus:bg-gray-700">Block Room</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {renderMessages()}
        <div ref={messageEndRef} />
        {typingUsers.length > 0 && (
          <div className="text-sm bg-gray-800 text-gray-200 p-2 w-64 max-w-80">
            <span className="font-semibold text-blue-300">{typingUsers.join(", ")}</span> {typingUsers.length === 1 ? "is" : "are"} typing...
          </div>
        )}
      </main>
      <footer className="p-4 border-t border-gray-700">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex space-x-2"
        >
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              socketRef.current?.emit("typing", { room: roomId, user: session?.user?.name, isTyping: e.target.value.length > 0 });
            }}
            className="flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          />
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
            <Send className="h-5 w-5 mr-2" />
            Send
          </Button>
        </form>
      </footer>
    </div>
  );
}