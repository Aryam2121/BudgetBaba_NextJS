"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from './AuthContext'

interface SocketContextType {
  socket: Socket | null
  connected: boolean
  joinRoom: (room: string) => void
  leaveRoom: (room: string) => void
  emit: (event: string, data: any) => void
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

interface SocketProviderProps {
  children: ReactNode
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const { user, token } = useAuth()

  useEffect(() => {
    if (user && token) {
      const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling']
      })

      socketInstance.on('connect', () => {
        console.log('Socket connected:', socketInstance.id)
        setConnected(true)
        
        // Join user-specific room
        socketInstance.emit('join', `user_${user.id}`)
      })

      socketInstance.on('disconnect', () => {
        console.log('Socket disconnected')
        setConnected(false)
      })

      socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
        setConnected(false)
      })

      setSocket(socketInstance)

      return () => {
        socketInstance.disconnect()
        setSocket(null)
        setConnected(false)
      }
    }
  }, [user, token])

  const joinRoom = (room: string) => {
    if (socket && connected) {
      socket.emit('join', room)
    }
  }

  const leaveRoom = (room: string) => {
    if (socket && connected) {
      socket.emit('leave', room)
    }
  }

  const emit = (event: string, data: any) => {
    if (socket && connected) {
      socket.emit(event, data)
    }
  }

  return (
    <SocketContext.Provider value={{ 
      socket, 
      connected, 
      joinRoom, 
      leaveRoom, 
      emit 
    }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}
