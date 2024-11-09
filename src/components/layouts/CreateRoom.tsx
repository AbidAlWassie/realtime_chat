// src/components/layouts/CreateRoom.tsx
"use client"

"use client"

import { createRoom } from "@/actions/actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function CreateRoom() {
  const [roomName, setRoomName] = useState("")
  const [roomDescription, setRoomDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { data: session } = useSession()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!session?.user?.id) {
      setError("You must be logged in to create a room.")
      setIsSubmitting(false)
      return
    }

    if (roomName.trim().length < 3) {
      setError("Room name must be at least 3 characters long.")
      setIsSubmitting(false)
      return
    }

    try {
      const newRoom = await createRoom(
        roomName,
        roomDescription,
        session.user.id
      )
      setRoomName("")
      setRoomDescription("")
      setOpen(false)
      router.push(`/room/${newRoom.id}`)
    } catch {
      setError("Failed to create room. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="bg-indigo-600 hover:bg-indigo-700">Create Room</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle>Create a New Room</DialogTitle>
          <DialogDescription>
            Enter a unique name and description for the new chat room.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="roomName">Room Name</Label>
            <Input
              id="roomName"
              placeholder="Enter room name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              required
              className="col-span-3 border-gray-700 placeholder:italic placeholder:text-slate-400 "
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="roomDescription">Room Description</Label>
            <Input
              id="roomDescription"
              placeholder="Enter room description"
              value={roomDescription}
              onChange={(e) => setRoomDescription(e.target.value)}
              className="col-span-3 border-gray-700 placeholder:italic placeholder:text-slate-400"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}  className="bg-slate-600 hover:bg-slate-700">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !session?.user} className="bg-blue-500 hover:bg-blue-600">
              {isSubmitting ? "Creating..." : "Create Room"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}