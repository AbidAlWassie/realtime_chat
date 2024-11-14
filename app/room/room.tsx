// src/app/room/room.tsx
"use client";

import { format } from "date-fns";
import { MoreVertical, Send, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Separator } from "../../components/ui/separator";

// Simulated group data
const group = {
  id: "1",
  name: "Project Team",
  image: "/placeholder.svg?height=40&width=40",
};

// Simulated user data
const users = [
  {
    id: "1",
    name: "Alice Johnson",
    image: "/placeholder.svg?height=40&width=40",
  },
  { id: "2", name: "Bob Smith", image: "/placeholder.svg?height=40&width=40" },
  {
    id: "3",
    name: "Charlie Brown",
    image: "/placeholder.svg?height=40&width=40",
  },
];

export default function ChatGroupPage() {
  const [messages, setMessages] = useState([
    {
      id: "1",
      content: "Welcome to the Project Team chat!",
      userId: "1",
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
    },
    {
      id: "2",
      content: "Hi everyone, excited to collaborate!",
      userId: "2",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
      id: "3",
      content: "Let's discuss our project goals.",
      userId: "1",
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
    },
    {
      id: "4",
      content: "I have some ideas to share. When's our next meeting?",
      userId: "3",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const { data: session } = useSession() as { data: { user: { id: string; name?: string | null; email?: string | null; image?: string | null; } } | null };
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && session?.user) {
      const messageData = {
        id: String(messages.length + 1),
        content: newMessage,
        userId: session?.user?.id || "1", // Fallback to '1' if session.user.id is undefined
        timestamp: new Date(),
      };
      setMessages([...messages, messageData]);
      setNewMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8 px-4">
      <Card className="w-full max-w-4xl mx-auto bg-slate-800 border-slate-700">
        <CardHeader className="bg-slate-700 px-6 py-4 flex flex-row items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="w-10 h-10">
              <AvatarImage src={group.image} alt={group.name} />
              <AvatarFallback>{group.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg font-semibold text-slate-100">
                {group.name}
              </CardTitle>
              <p className="text-sm text-slate-400">{users.length} members</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-slate-100 hover:bg-slate-600"
            >
              <Users className="h-5 w-5" />
              <span className="sr-only">Group members</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-slate-100 hover:bg-slate-600"
            >
              <MoreVertical className="h-5 w-5" />
              <span className="sr-only">More options</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[60vh] p-6" ref={scrollAreaRef}>
            {messages.map((msg) => {
              const user = users.find((u) => u.id === msg.userId) || {
                name: "Unknown User",
                image: "",
              };
              const isCurrentUser = msg.userId === session?.user?.id;
              return (
                <div
                  key={msg.id}
                  className={`mb-4 flex items-start space-x-3 ${
                    isCurrentUser ? "flex-row-reverse space-x-reverse" : ""
                  }`}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.image} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div
                    className={`flex flex-col ${
                      isCurrentUser ? "items-end" : "items-start"
                    }`}
                  >
                    <div className="flex items-baseline space-x-2">
                      <span className="text-sm font-semibold text-slate-300">
                        {user.name}
                      </span>
                      <span className="text-xs text-slate-500">
                        {format(msg.timestamp, "HH:mm")}
                      </span>
                    </div>
                    <p
                      className={`mt-1 text-sm rounded-lg py-2 px-3 ${
                        isCurrentUser
                          ? "bg-blue-600 text-white"
                          : "bg-slate-700 text-slate-300"
                      }`}
                    >
                      {msg.content}
                    </p>
                  </div>
                </div>
              );
            })}
          </ScrollArea>
        </CardContent>
        <Separator className="bg-slate-700" />
        <CardFooter className="p-4">
          <form onSubmit={handleSendMessage} className="flex space-x-2 w-full">
            <Input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-grow bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500"
            />
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
