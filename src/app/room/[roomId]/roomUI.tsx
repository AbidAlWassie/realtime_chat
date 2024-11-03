// src/app/room/[roomId]/roomUI.tsx
"use client";

import { fetchMessages, storeMessage } from "@/actions/actions";
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
import { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  room: string;
}

const serverAddress = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:3001";

interface RoomUIProps {
  roomId: string;
}

export default function RoomUI({ roomId }: RoomUIProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const prevMessageCount = useRef(messages.length);

  const loadMessages = async () => {
    const initialMessages = await fetchMessages(roomId);
    const formattedMessages = initialMessages.map(msg => ({
      ...msg,
      senderId: msg.senderName || "unknown",
      senderName: msg.senderName === session?.user?.name ? "You" : (msg.senderName || "unknown"),
      room: roomId,
    }));
    setMessages(formattedMessages);
  };

  const sendMessage = async () => {
    if (message.trim() && socketRef.current) {
      const senderId = session?.user?.email || "anonymous";
      const senderName = session?.user?.name || "Anonymous";

      const newMessage = {
        content: message,
        senderId,
        senderName,
        room: roomId,
      };

      socketRef.current.emit("send_message", newMessage);

      const savedMessage = await storeMessage(message, senderId, senderName, roomId);

      const formattedMessage: Message = {
        id: savedMessage.id,
        content: savedMessage.content,
        senderId: savedMessage.userId,
        senderName: "You",
        room: roomId,
      };

      setMessages(prev => [...prev, formattedMessage]);
      setMessage("");
      
      socketRef.current.emit("typing", { room: roomId, user: session?.user?.name, isTyping: false });
    }
  };

  useEffect(() => {
    loadMessages();

    if (!socketRef.current) {
      socketRef.current = io(serverAddress, { transports: ["websocket"] });
      console.log("Socket connected");
    }

    const socket = socketRef.current;

    socket.emit("join_room", roomId);
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

    return () => {
      socket.off("receive_message");
      socket.off("user_typing");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomId, session]);

  useEffect(() => {
    if (messages.length > prevMessageCount.current) {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    
    prevMessageCount.current = messages.length;
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <header className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <Link href="/" passHref>
            <Button variant="ghost" size="icon" className="text-blue-400 hover:text-blue-300">
              <ArrowLeft className="h-6 w-6" />
              <span className="sr-only">Back to Rooms</span>
            </Button>
          </Link>
          <Avatar>
            <AvatarImage src="/placeholder-avatar.jpg" alt="Room Avatar" />
            <AvatarFallback>RA</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-lg font-semibold">Room Name</h1>
            <p className="text-sm text-gray-400">
              {typingUsers.length > 0
                ? `${typingUsers.join(", ")} ${typingUsers.length === 1 ? "is" : "are"} typing...`
                : "No one is typing"}
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
              <DropdownMenuItem className="text-gray-200 focus:bg-gray-700">Edit Room</DropdownMenuItem>
              <DropdownMenuItem className="text-gray-200 focus:bg-gray-700">Mute Notifications</DropdownMenuItem>
              <DropdownMenuItem className="text-gray-200 focus:bg-gray-700">Block Room</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.senderName === "You" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`p-3 rounded-lg max-w-[70%] min-w-[80px] ${
                msg.senderName === "You" 
                  ? "bg-blue-600 text-white " 
                  : "bg-gray-700 text-gray-200"
              }`}
            >
              <p className="font-semibold">{msg.senderName}</p>
              <p>{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={messageEndRef} />
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