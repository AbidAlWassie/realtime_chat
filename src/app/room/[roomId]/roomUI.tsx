// src/app/room/[roomId]/RoomUI.tsx

"use client";

import { fetchMessages, storeMessage } from "@/actions/actions";
import { useSession } from "next-auth/react";
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
  const messageEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const prevMessageCount = useRef(messages.length); // Ref to track previous message count

  const loadMessages = async () => {
    const initialMessages = await fetchMessages(roomId);
    const formattedMessages = initialMessages.map(msg => ({
      ...msg,
      senderId: msg.senderName || "unknown",
      senderName: msg.senderName || "unknown",
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

      // Send message to the server
      socketRef.current.emit("send_message", newMessage);

      // Save the message to the database
      const savedMessage = await storeMessage(message, senderId, senderName, roomId);

      // Map savedMessage to the Message interface
      const formattedMessage: Message = {
        id: savedMessage.id,
        content: savedMessage.content,
        senderId: savedMessage.userId,
        senderName: "You",
        room: roomId,
      };

      // Add message to local state
      setMessages(prev => [...prev, formattedMessage]);
      setMessage("");
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

    return () => {
      socket.off("receive_message");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomId, session]);

  useEffect(() => {
    // Scroll only if new messages were added
    if (messages.length > prevMessageCount.current) {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    
    // Update previous message count after each render
    prevMessageCount.current = messages.length;
  }, [messages]);

  return (
    <div className="space-y-4">
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Messages:</h2>
        <div id="MsgContainer" className="p-3 bg-slate-700 rounded-lg min-h-[150px] max-h-[80%] overflow-y-auto space-y-2">
          {messages.length ? (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-2 rounded-lg ${
                  msg.senderName === "You" ? "bg-blue-600 text-right ml-auto" : "bg-gray-500 text-left"
                } max-w-[80%]`}
              >
                <span className="font-bold">{msg.senderName}:</span> {msg.content}
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
