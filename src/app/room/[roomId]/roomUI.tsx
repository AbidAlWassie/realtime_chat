// src/app/room/[roomId]/RoomUI.tsx

"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";

interface Message {
  message: string;
  senderId: string;
  senderName: string;
  room: string;
}

const serverAddress = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:3001";

interface RoomUIProps {
  roomId: string;
}

export default function RoomUI({ roomId }: RoomUIProps) {
  const { data: session } = useSession(); // Get user session
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const messageEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const sendMessage = () => {
    if (message.trim() && socketRef.current) {
      const newMessage = {
        message,
        senderId: session?.user?.email || "anonymous",
        senderName: session?.user?.name || "Anonymous",
        room: roomId,
      };
      console.log("Sending message:", newMessage);
      socketRef.current.emit("send_message", newMessage);

      // Add your own message temporarily
      setMessages((prev) => [...prev, { ...newMessage, senderName: "You" }]);
      setMessage("");
    }
  };

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(serverAddress, { transports: ["websocket"] });
      console.log("Socket connected");
    }

    const socket = socketRef.current;

    // Join the specified room
    socket.emit("join_room", roomId);
    console.log(`Client joined room: ${roomId}`);

    // Listen for incoming messages
    socket.on("receive_message", (data: Message) => {
      console.log("Received message:", data);
      // Only add the message if it was sent by someone else
      if (data.senderName !== session?.user?.name) {
        setMessages((prev) => [...prev, data]);
      }
    });

    return () => {
      socket.off("receive_message");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomId, session]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="space-y-4">
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Messages:</h2>
        <div className="p-3 bg-slate-700 rounded-lg min-h-[150px] max-h-[300px] overflow-y-auto space-y-2">
          {messages.length ? (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`p-2 rounded-lg ${
                  msg.senderName === "You" ? "bg-blue-600 text-right ml-auto" : "bg-gray-500 text-left"
                } max-w-[80%]`}
              >
                <span className="font-bold">{msg.senderName}:</span> {msg.message}
              </div>
            ))
          ) : (
            <p className="text-center">No messages yet</p>
          )}
          <div ref={messageEndRef} />
        </div>

        <input
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="bg-slate-700 border-slate-600 text-white w-full p-2 rounded mt-4"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded mt-2"
        >
          Send Message
        </button>
      </div>
    </div>
  );
}
