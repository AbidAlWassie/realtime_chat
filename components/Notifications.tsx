// components/Notifications.tsx
'use client'

import { getUnreadNotifications, markNotificationAsRead, storeNotification } from '@/actions/actions'
import { useSession } from 'next-auth/react'
import { useCallback, useEffect, useState } from 'react'
import io from 'socket.io-client'

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

  useEffect(() => {
    if (session?.user?.id) {
      const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001')

      newSocket.on('connect', () => {
        console.log('Connected to notification system')
        newSocket.emit('authenticate', session.user.id)
      })

      newSocket.on('new_notification', async (notification: Notification) => {
        console.log('Received new notification:', notification)
        try {
          await storeNotification(session.user.id, notification.senderId, notification.content)
          console.log('Notification stored successfully')
          setUnreadMessages(prev => ({
            ...prev,
            [notification.senderId]: (prev[notification.senderId] || 0) + 1
          }))
        } catch (error) {
          console.error('Error storing notification:', error)
        }
      })

      loadUnreadNotifications()

      return () => {
        newSocket.disconnect()
      }
    }
  }, [session?.user?.id, loadUnreadNotifications])

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