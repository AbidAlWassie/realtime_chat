'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useEffect, useState } from 'react'

import { fetchUsers } from '@/actions/actions'

const rooms = [
  {
    id: "1",
    name: "General Chat",
    description: "Open discussion for all topics",
    image: "",
  },
  {
    id: "2",
    name: "Tech Talk",
    description: "Discuss the latest in technology",
    image: "",
  },
  {
    id: "3",
    name: "Book Club",
    description: "Share your favorite reads",
    image: "",
  },
]

export default function Home() {
  const { status } = useSession()
  const [users, setUsers] = useState<{ id: string; name: string | null; email: string; image: string | null; }[]>([])

  useEffect(() => {
    async function loadUsers() {
      if (status === 'authenticated') {
        const fetchedUsers = await fetchUsers()
        setUsers(fetchedUsers)
      }
    }
    loadUsers()
  }, [status])

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Welcome to Our Chat App
        </h1>

        {status === "loading" && <p className="text-center">Loading...</p>}

        {status === "unauthenticated" && (
          <div className="text-center">
            <p className="mb-4">Please sign in to access the chat rooms.</p>
            <Button asChild>
              <Link href="/api/auth/signin">Sign In</Link>
            </Button>
          </div>
        )}

        {status === "authenticated" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle>Chat Rooms</CardTitle>
                <CardDescription>
                  Join a room or create a new one
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  {rooms.map((room) => (
                    <Link href={`/room/${room.id}`} key={room.id}>
                      <div className="flex items-center space-x-4 mb-4 p-4 hover:bg-slate-700 rounded-lg cursor-pointer">
                        <Avatar className="">
                          <AvatarImage src={room.image} alt={room.name} />
                          <AvatarFallback className="bg-gray-600">{room.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{room.name}</h3>
                          <p className="text-sm text-slate-400">
                            {room.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </ScrollArea>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Create New Room</Button>
              </CardFooter>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle>Online Users</CardTitle>
                <CardDescription>See who is currently online</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center space-x-4 mb-4 p-4 hover:bg-slate-700 rounded-lg cursor-pointer"
                    >
                      <Avatar>
                        <AvatarImage src={user.image ?? `/placeholder.svg?height=40&width=40`} alt={user.name || 'User'} />
                        <AvatarFallback className="bg-gray-600">{user.name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-slate-400">Online</p>
                      </div>
                    </div>
                  ))}
                  {users.length === 0 && <p className="text-center">No users online</p>}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}