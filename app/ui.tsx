// src/app/ui.tsx
'use client'

import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { Button } from "../components/ui/button"
import {
  Card,
  CardContent
} from "../components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import { Input } from "../components/ui/input"
import { ScrollArea } from "../components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"

import { MdMessage, MdPeopleAlt } from 'react-icons/md'
import { fetchRooms, fetchUsers } from '../actions/actions'
import CreateRoom from '../components/layouts/CreateRoom'
import Footer from "../components/layouts/Footer"

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

interface Room {
  id: string;
  name: string;
  description: string;
}

function ChatRoomsList({ rooms }: { rooms: Room[] }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingRoomId, setLoadingRoomId] = useState<string | null>(null)

  const handleRoomClick = (roomId: string) => {
    setIsLoading(true)
    setLoadingRoomId(roomId)
    router.push(`/room/${roomId}`)
  }

  return (
    <ScrollArea className="h-[64vh]">
      {rooms.map((room) => (
        <div
          key={room.id}
          onClick={() => handleRoomClick(room.id)}
          className="flex items-center space-x-4 mb-4 p-4 hover:bg-slate-700 rounded-lg cursor-pointer"
        >
          <Avatar>
            <AvatarImage src={``} alt={room.name} />
            <AvatarFallback className="bg-gray-600">{room.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-grow">
            <h3 className="font-semibold">{room.name}</h3>
            <p className="text-sm text-slate-400">
              {room.description}
            </p>
          </div>
          {isLoading && loadingRoomId === room.id && (
            <p className="text-sm text-blue-400">Loading...</p>
          )}
        </div>
      ))}
      {rooms.length === 0 && <p className="text-center">No rooms available</p>}
    </ScrollArea>
  )
}

function DMsList({ users }: { users: User[] }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const handleUserClick = (userId: string) => {
    setIsLoading(true)
    setLoadingUserId(userId)
    router.push(`/dm/${userId}`)
  }

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <Input
        type="text"
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border-gray-500 placeholder:text-gray-400 focus:border-blue-500 border-2 mb-2"
      />
      <ScrollArea className="h-[64vh]">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            onClick={() => handleUserClick(user.id)}
            className="flex items-center space-x-4 mb-2 p-4 hover:bg-slate-700 rounded-lg cursor-pointer"
          >
            <Avatar>
              <AvatarImage src={user.image ?? ``} alt={user.name || 'User'} />
              <AvatarFallback className="bg-gray-600">{user.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-grow">
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-slate-400">{user.email}</p>
            </div>
            {isLoading && loadingUserId === user.id && (
              <p className="text-sm text-blue-400">Loading...</p>
            )}
          </div>
        ))}
        {filteredUsers.length === 0 && <p className="text-center">No users found</p>}
      </ScrollArea>
    </div>
  )
}

export default function Home() {
  const { data: session, status } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      if (status === 'authenticated') {
        const [fetchedUsers, fetchedRooms] = await Promise.all([
          fetchUsers(),
          fetchRooms()
        ])
        setUsers(fetchedUsers)
        setRooms(fetchedRooms.map(room => ({
          ...room,
          name: room.name || 'Untitled Room',
          description: room.description || 'No description available',
        })))
      }
    }
    loadData()
  }, [status])

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Navbar */}
      <nav className="bg-slate-800 py-4 px-6 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-indigo-400 hover:text-indigo-300">
          BlazeChat
        </Link>
        {status === "authenticated" && session?.user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session.user.image || ''} alt={session.user.name || 'User'} />
                  <AvatarFallback>{session.user.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-gray-800 border-gray-600" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{session.user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/profile')} className="cursor-pointer py-2">
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer py-2">
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/api/auth/signout')} className="cursor-pointer py-2">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </nav>

      <div className="max-w-6xl mx-auto py-8 px-4">
        {status === "loading" && <p className="text-center">Loading...</p>}

        {status === "unauthenticated" && (
          <div className="text-center">
            <p className="mb-4">Please sign in to access the chat rooms.</p>
            <Button asChild className="bg-indigo-600 text-indigo-50 hover:bg-indigo-700">
              <Link href="/api/auth/signin">Sign In</Link>
            </Button>
            <Footer />
          </div>
        )}

        {status === "authenticated" && (
          <Card className="bg-slate-800 border-slate-700 pt-6 pb-0">
            <CardContent className="h-[80vh]">
              <Tabs defaultValue="dms" className="w-full mb-2">
                <TabsList className="grid w-full grid-cols-2 mb-8 px-0">
                  <TabsTrigger 
                    value="dms"
                    className="py-3 data-[state=active]:bg-blue-700 data-[state=active]:text-white data-[state=inactive]:bg-gray-600 mr-1"
                  >
                    <div className="flex justify-center items-center gap-2">
                      <MdMessage />
                      <p>Direct Messages</p>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="rooms"
                    className="py-3 data-[state=active]:bg-blue-700 data-[state=active]:text-white data-[state=inactive]:bg-gray-600 ml-1"
                  >
                    <div className="flex justify-center items-center gap-2">
                      <MdPeopleAlt />
                      <p>Chat Rooms</p>
                    </div>
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="dms">
                  <DMsList users={users} />
                </TabsContent>
                <TabsContent value="rooms">
                  <ChatRoomsList rooms={rooms} />
                  <div className="mt-4">
                    <CreateRoom />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
        <p className="font-bold text-center mt-6">
          Developed by <span className="text-indigo-400 hover:text-indigo-500"><Link href="https://abidalwassie.me/" target="_blank">Abid Al Wassie</Link></span>
        </p>
      </div>
    </div>
  )
}