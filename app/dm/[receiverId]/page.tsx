// src/app/dm/[receiverId]/page.tsx
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { getUserById } from "../../../actions/actions"
import { authOptions } from "../../../auth/authOptions"
import SessionProvider from "../../../components/SessionProvider"
import DMUI from "./dmUI"

interface DirectMessagePageProps {
  params: { receiverId: string }
}

export default async function DirectMessagePage({ params }: DirectMessagePageProps) {
  const { receiverId } = params
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/api/auth/signin")
  }

  const receiver = await getUserById(receiverId)

  if (!receiver) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
          <p className="text-muted-foreground">The user you are trying to message doesnt exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background min-h-screen">
      <SessionProvider session={session}>
        <DMUI 
          receiverId={receiverId} 
          receiverName={receiver.name || "Unknown User"} 
          receiverImage={receiver.image || "/placeholder-avatar.png"} 
        />
      </SessionProvider>
    </div>
  )
}