import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinProjectRoom: (projectId: string) => void;
  leaveProjectRoom: (projectId: string) => void;
  joinIssueRoom: (issueId: string) => void;
  leaveIssueRoom: (issueId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const socketInstance = io('/', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      console.log('⚡ Socket connected to DevFlow server');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('⚡ Socket disconnected');
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [token, user]);

  const joinProjectRoom = (projectId: string) => {
    socket?.emit('join_project', projectId);
  };

  const leaveProjectRoom = (projectId: string) => {
    socket?.emit('leave_project', projectId);
  };

  const joinIssueRoom = (issueId: string) => {
    socket?.emit('join_issue', issueId);
  };

  const leaveIssueRoom = (issueId: string) => {
    socket?.emit('leave_issue', issueId);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinProjectRoom,
        leaveProjectRoom,
        joinIssueRoom,
        leaveIssueRoom,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within SocketProvider');
  return context;
};
