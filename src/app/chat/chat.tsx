"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Send } from "lucide-react";
import { useSession } from "next-auth/react";
import { FormEvent, useEffect, useRef, useState } from "react";

// Simulated group data

// Simulated user data
const users = [
  { id: "1", name: "Alice Johnson", image: "/placeholder.svg?height=40&width=40" },
  { id: "2", name: "Bob Smith", image: "/placeholder.svg?height=40&width=40" },
  { id: "3", name: "Charlie Brown", image: "/placeholder.svg?height=40&width=40" },
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
  const [isLoading, setIsLoading] = useState(false); // Added state for loading

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && session?.user) {
      setIsLoading(true); // Set loading to true
      try {
        const messageData = {
          id: String(messages.length + 1),
          content: newMessage,
          userId: (session.user as { id: string }).id || "1", // Fallback to '1' if session.user.id is undefined
          timestamp: new Date(),
        };
        setMessages([...messages, messageData]);
        setNewMessage("");
      } finally {
        setIsLoading(false); // Set loading to false regardless of success or failure
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8 px-4">
      <Card className="w-full max-w-3xl mx-auto mt-8 h-[80vh] flex flex-col bg-slate-800 border-slate-700">
        <CardHeader className="bg-slate-700 text-slate-100">
          <CardTitle className="text-2xl font-bold">Chat Room</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-full p-4 text-slate-100" ref={scrollAreaRef}>
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
                  <div className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"}`}>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-sm font-semibold text-slate-300">
                        {user.name}
                      </span>
                      <span className="text-xs text-slate-500">
                        {format(msg.timestamp, "HH:mm")}
                      </span>
                    </div>
                    <div
                      className={`mt-1 text-sm rounded-lg p-3 max-w-[70%] ${
                        msg.userId === (session?.user as { id: string })?.id
                          ? "bg-blue-600 text-white"
                          : "bg-slate-700 text-slate-300"
                      }`}
                    >
                      {msg.content}
                    </div>
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
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}