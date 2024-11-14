'use client'

import { fetchDirectMessages, storeDirectMessage } from "@/actions/actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, MoreVertical, Phone, Send, Video } from 'lucide-react'
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import io, { Socket } from "socket.io-client"

interface Message {
  id: string
  content: string
  senderId: string
  createdAt: string
}

interface DMUIProps {
  receiverId: string
  receiverName: string
  receiverImage: string
}

const serverAddress = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL;

export default function DMUI({ receiverId, receiverName, receiverImage }: DMUIProps) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [message, setMessage] = useState("")
  const messageEndRef = useRef<HTMLDivElement>(null)
  const [isTyping, setIsTyping] = useState(false)
  const socketRef = useRef<Socket | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const loadMessages = useCallback(async () => {
    if (session?.user?.id) {
      const initialMessages = await fetchDirectMessages(session.user.id, receiverId)
      setMessages(initialMessages.map(msg => ({ ...msg, createdAt: new Date(msg.createdAt).toISOString() })))
    }
  }, [session?.user?.id, receiverId])

  const sendMessage = async () => {
    if (message.trim() && session?.user?.id) {
      const newMessage = {
        id: Date.now().toString(), // Temporary ID
        content: message,
        senderId: session.user.id,
        createdAt: new Date().toISOString(),
      }
      
      // Optimistic update
      setMessages(prev => [...prev, newMessage])
      setMessage("")

      try {
        const savedMessage = await storeDirectMessage(message, session.user.id, receiverId)
        socketRef.current?.emit("send_direct_message", {
          ...savedMessage,
          createdAt: new Date(savedMessage.createdAt).toISOString()
        })
        
        // Update the message with the server-generated ID
        setMessages(prev => 
          prev.map(msg => msg.id === newMessage.id ? { ...savedMessage, createdAt: new Date(savedMessage.createdAt).toISOString() } : msg)
        )
      } catch (error) {
        console.error("Failed to send message:", error)
        // Remove the optimistically added message if it failed to send
        setMessages(prev => prev.filter(msg => msg.id !== newMessage.id))
      }
    }
  }

  const handleTyping = () => {
    if (socketRef.current && session?.user?.id) {
      socketRef.current.emit("typing", { 
        senderId: session.user.id, 
        receiverId
      });
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit("stop_typing", { 
          senderId: session.user.id, 
          receiverId
        });
      }, 1000)
    }
  }


  useEffect(() => {
    loadMessages()

    if (!socketRef.current) {
      socketRef.current = io(serverAddress, { transports: ["websocket"] })
    }

    const socket = socketRef.current
    socket.emit("join_direct", { senderId: session?.user?.id, receiverId })

    socket.on("receive_direct_message", (data: Message) => {
      if (data.senderId !== session?.user?.id) {
        setMessages((prev) => [...prev, { ...data, createdAt: new Date(data.createdAt).toISOString() }])
      }
    })

    socket.on("user_typing", ({ senderId, isTyping }) => {
      if (senderId === receiverId) {
        setIsTyping(isTyping)
      }
    })

    socket.on("user_stop_typing", ({ senderId }) => {
      if (senderId === receiverId) {
        setIsTyping(false)
      }
    })

    return () => {
      socket.off("receive_direct_message")
      socket.off("user_typing")
      socket.off("user_stop_typing")
      socket.disconnect()
      socketRef.current = null
    }
  }, [receiverId, session, loadMessages])

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (days === 1) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString()
    }
  }

  const renderMessages = () => {
    let lastDate: Date | null = null
    return messages.map((msg) => {
      const messageDate = new Date(msg.createdAt)
      let showTimestamp = false

      if (!lastDate || messageDate.getTime() - lastDate.getTime() >= 60 * 60 * 1000) {
        showTimestamp = true
        lastDate = messageDate
      }

      return (
        <div key={msg.id}>
          {showTimestamp && (
            <div className="text-center text-sm text-gray-500 my-2">
              {formatDate(messageDate)}
            </div>
          )}
          <div className={`flex ${msg.senderId === session?.user?.id ? "justify-end" : "justify-start"}`}>
            <div className={`p-3 rounded-lg max-w-[70%] ${msg.senderId === session?.user?.id ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-200"}`}>
              <p>{msg.content}</p>
            </div>
          </div>
        </div>
      )
    })
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <header className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <Link href="/" passHref>
            <Button variant="ghost" size="icon" className="text-blue-400 hover:text-blue-300">
              <ArrowLeft className="h-6 w-6" />
              <span className="sr-only">Back to Chats</span>
            </Button>
          </Link>
          <Avatar>
            <AvatarImage src={receiverImage} alt={receiverName} />
            <AvatarFallback className="bg-gray-600">{receiverName[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-lg font-semibold">{receiverName}</h1>
            <p className="text-sm text-gray-400">{isTyping ? "Typing..." : "Online"}</p>
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
          <Button variant="ghost" size="icon" className="text-blue-400 hover:text-blue-300">
            <MoreVertical className="h-5 w-5" />
            <span className="sr-only">More options</span>
          </Button>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {renderMessages()}
        <div ref={messageEndRef} />
        {isTyping ? 
        <div className="text-sm bg-gray-800 text-gray-200 p-2 w-64 max-w-80">
          <span className="font-semibold text-blue-300">{receiverName}</span> is typing...
        </div> : null}
      </main>
      <footer className="p-4 border-t border-gray-700">
        <form onSubmit={(e) => { e.preventDefault(); sendMessage() }} className="flex space-x-2">
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => {
              setMessage(e.target.value)
              handleTyping()
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
  )
}