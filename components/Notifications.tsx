// components/Notifications.tsx
'use client'

import { getUnreadNotifications, markNotificationAsRead, storeNotification } from '@/actions/actions'
import { useSession } from 'next-auth/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import io, { Socket } from 'socket.io-client'

interface Notification {
  id: string
  senderId: string
  content: string
  createdAt: Date
}

interface UnreadMessages {
  [userId: string]: number
}

export function NotificationSystem() {
  const { data: session } = useSession()
  const [unreadMessages, setUnreadMessages] = useState<UnreadMessages>({})
  const socketRef = useRef<Socket | null>(null)

  const loadUnreadNotifications = useCallback(async () => {
    if (session?.user?.id) {
      try {
        const notifications = await getUnreadNotifications(session.user.id)
        console.log('Loaded unread notifications:', notifications)
        const newUnreadMessages = notifications.reduce((acc, notification) => {
          acc[notification.senderId] = (acc[notification.senderId] || 0) + 1
          return acc
        }, {} as UnreadMessages)
        setUnreadMessages(newUnreadMessages)
      } catch (error) {
        console.error('Error loading unread notifications:', error)
      }
    }
  }, [session?.user?.id])

  const connectSocket = useCallback(() => {
    if (!socketRef.current && session?.user?.id) {
      const serverUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL
      if (!serverUrl) {
        console.error('Socket server URL is not defined')
        return
      }

      console.log('Connecting to socket server:', serverUrl)
      socketRef.current = io(serverUrl, {
        transports: ['websocket'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      })

      socketRef.current.on('connect', () => {
        console.log('Connected to notification system')
        socketRef.current?.emit('authenticate', session.user.id)
      })

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
      })

      socketRef.current.on('new_notification', async (notification: Notification) => {
        console.log('Received new notification:', notification)
        try {
          const storedNotification = await storeNotification(session.user.id, notification.senderId, notification.content)
          console.log('Notification stored successfully:', storedNotification)
          setUnreadMessages(prev => ({
            ...prev,
            [notification.senderId]: (prev[notification.senderId] || 0) + 1
          }))
        } catch (error) {
          console.error('Error storing notification:', error)
        }
      })
    }
  }, [session?.user?.id])

  useEffect(() => {
    loadUnreadNotifications()
    connectSocket()

    return () => {
      if (socketRef.current) {
        console.log('Disconnecting socket')
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [session?.user?.id, loadUnreadNotifications, connectSocket])

  const markAsRead = async (senderId: string) => {
    if (session?.user?.id) {
      try {
        const notifications = await getUnreadNotifications(session.user.id)
        const userNotifications = notifications.filter(n => n.senderId === senderId)
        
        for (const notification of userNotifications) {
          await markNotificationAsRead(notification.id)
        }

        setUnreadMessages(prev => ({
          ...prev,
          [senderId]: 0,
        }))
      } catch (error) {
        console.error('Error marking notifications as read:', error)
      }
    }
  }

  return { unreadMessages, markAsRead }
}