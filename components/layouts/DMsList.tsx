'use client'
'use client'

import { NotificationSystem } from "@/components/Notifications"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRouter } from "next/navigation"
import { useState } from 'react'

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

interface DMsListProps {
  users: User[];
}

export function DMsList({ users }: DMsListProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { unreadMessages, markAsRead } = NotificationSystem()

  const handleUserClick = async (userId: string) => {
    setIsLoading(true)
    setLoadingUserId(userId)
    await markAsRead(userId)
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
            className="flex items-center space-x-4 mb-2 p-4 hover:bg-slate-700 rounded-lg cursor-pointer relative"
          >
            <div className="relative">
              <Avatar>
                <AvatarImage src={user.image ?? ``} alt={user.name || 'User'} />
                <AvatarFallback className="bg-gray-600">{user.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              {unreadMessages[user.id] > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-indigo-600 rounded-full">
                  {unreadMessages[user.id]}
                </Badge>
              )}
            </div>
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