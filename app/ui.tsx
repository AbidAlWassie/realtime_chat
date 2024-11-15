// src/app/ui.tsx
'use client'

import { ChatRoomsList } from "@/components/layouts/ChatRooms"
import { DMsList } from "@/components/layouts/DMsList"
import { Navbar } from "@/components/layouts/Navbar"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useEffect, useState } from 'react'
import { MdMessage, MdPeopleAlt } from 'react-icons/md'
import { fetchRooms, fetchUsers } from '../actions/actions'
import CreateRoom from '../components/layouts/CreateRoom'
import Footer from "../components/layouts/Footer"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"

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

export default function Home() {
  const { status } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [rooms, setRooms] = useState<Room[]>([])

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
      <Navbar />

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