// src/components/MessageArea.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";

const serverAddress = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:3001";

interface Message {
  senderId: string;
  message: string;
  room: string;
}

export default function MessageArea() {
  const [room, setRoom] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [isInRoom, setIsInRoom] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const joinRoom = () => {
    if (room.trim() && socketRef.current) {
      socketRef.current.emit("join_room", room);
      setIsInRoom(true);
    }
  };

  const sendMessage = () => {
    if (message.trim() && room && socketRef.current) {
      const newMessage = { message, senderId: socketRef.current.id!, room };
      socketRef.current.emit("send_message", newMessage);
      setMessages((prev) => [...prev, { ...newMessage, senderId: "You" }]);
      setMessage("");
    }
  };

  useEffect(() => {
    // Initialize socket connection
    if (!socketRef.current) {
      socketRef.current = io(serverAddress);
    }

    const socket = socketRef.current;

    // Listen for incoming messages
    socket.on("receive_message", (data: Message) => {
      if (data.senderId !== socket.id) {
        setMessages((prev) => [...prev, data]);
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("Disconnected from server");
      setIsInRoom(false);
    });

    return () => {
      socket.off("receive_message");
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    // Scroll to the latest message
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <input
          placeholder="Room Number..."
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 w-full p-2 rounded"
        />
        <button
          onClick={joinRoom}
          disabled={isInRoom}
          className={`w-full py-2 rounded ${isInRoom ? "bg-green-600" : "bg-blue-600 hover:bg-blue-700"} text-white`}
        >
          {isInRoom ? "Joined Room" : "Join Room"}
        </button>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold text-white mb-2">Messages:</h2>
        <div className="p-3 bg-slate-700 rounded-lg text-white min-h-[150px] max-h-[300px] overflow-y-auto space-y-2">
          {messages.length ? (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`p-2 rounded-lg ${
                  msg.senderId === "You" ? "bg-blue-600 text-right ml-auto" : "bg-gray-500 text-left"
                } max-w-[80%]`}
              >
                <span className="font-bold">
                  {msg.senderId === "You" ? "You" : msg.senderId}:
                </span>{" "}
                {msg.message}
              </div>
            ))
          ) : (
            <p className="text-center">No messages yet</p>
          )}
          <div ref={messageEndRef} />
        </div>

        <input
          placeholder="Message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 w-full p-2 rounded mt-4"
        />
        <button
          onClick={sendMessage}
          disabled={!isInRoom}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
        >
          Send Message
        </button>
      </div>
    </div>
  );
}
