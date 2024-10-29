// "use client";

// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Separator } from "@/components/ui/separator";
// import { Loader2, Send } from "lucide-react";
// import { useSession } from "next-auth/react";
// import { useEffect, useRef, useState } from "react";
// import io from "socket.io-client";

// let socket;

// export default function ImprovedChat() {
//   const [message, setMessage] = useState("");
//   const [messages, setMessages] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const { data: session } = useSession();
//   const scrollAreaRef = useRef(null);

//   useEffect(() => {
//     socketInitializer();
//   }, []);

//   useEffect(() => {
//     if (scrollAreaRef.current) {
//       scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
//     }
//   }, [messages]);

//   const socketInitializer = async () => {
//     await fetch("/api/socket");
//     socket = io();

//     socket.on("chat message", (msg) => {
//       setMessages((prevMessages) => [...prevMessages, msg]);
//     });
//   };

//   const sendMessage = async (e) => {
//     e.preventDefault();
//     if (message.trim() && session) {
//       setIsLoading(true);
//       const messageData = {
//         content: message,
//         userId: session.user.id,
//         userName: session.user.name,
//         userImage: session.user.image,
//       };
//       socket.emit("chat message", messageData);
//       setMessage("");

//       try {
//         await fetch("/api/messages/create", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(messageData),
//         });
//       } catch (error) {
//         console.error("Error sending message:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     }
//   };

//   return (
//     <Card className="w-full max-w-3xl mx-auto mt-8 h-[80vh] flex flex-col">
//       <CardHeader className="bg-primary text-primary-foreground">
//         <CardTitle className="text-2xl font-bold">Chat Room</CardTitle>
//       </CardHeader>
//       <CardContent className="flex-grow p-0">
//         <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
//           {messages.map((msg, index) => (
//             <div key={index} className="mb-4">
//               <div
//                 className={`flex items-start space-x-2 ${
//                   msg.userId === session?.user?.id
//                     ? "justify-end"
//                     : "justify-start"
//                 }`}
//               >
//                 {msg.userId !== session?.user?.id && (
//                   <Avatar className="w-8 h-8">
//                     <AvatarImage src={msg.userImage} alt={msg.userName} />
//                     <AvatarFallback>{msg.userName.charAt(0)}</AvatarFallback>
//                   </Avatar>
//                 )}
//                 <div
//                   className={`rounded-lg p-3 max-w-[70%] ${
//                     msg.userId === session?.user?.id
//                       ? "bg-primary text-primary-foreground"
//                       : "bg-secondary text-secondary-foreground"
//                   }`}
//                 >
//                   {msg.userId !== session?.user?.id && (
//                     <p className="font-semibold text-sm mb-1">{msg.userName}</p>
//                   )}
//                   <p className="text-sm">{msg.content}</p>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </ScrollArea>
//       </CardContent>
//       <Separator />
//       <CardFooter className="p-4">
//         <form onSubmit={sendMessage} className="flex space-x-2 w-full">
//           <Input
//             type="text"
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             placeholder="Type a message..."
//             className="flex-grow"
//             disabled={isLoading}
//           />
//           <Button type="submit" disabled={isLoading}>
//             {isLoading ? (
//               <Loader2 className="w-4 h-4 animate-spin" />
//             ) : (
//               <Send className="w-4 h-4" />
//             )}
//             <span className="sr-only">Send</span>
//           </Button>
//         </form>
//       </CardFooter>
//     </Card>
//   );
// }
