import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verifyAccessToken } from '../utils/jwt';
import { config } from '../config/env';

export class SocketManager {
  private static instance: SocketManager;
  private io: SocketIOServer | null = null;

  public static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  public init(server: HttpServer): SocketIOServer {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: config.clientUrl,
        credentials: true,
      },
    });

    this.io.use((socket: Socket, next) => {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      if (!token) {
        return next(new Error('Authentication token required for Socket connection'));
      }
      try {
        const decoded = verifyAccessToken(token);
        (socket as any).userId = decoded.userId;
        next();
      } catch (err) {
        next(new Error('Invalid Socket authentication token'));
      }
    });

    this.io.on('connection', (socket: Socket) => {
      const userId = (socket as any).userId;
      console.log(`🔌 Socket connected: User ${userId} (${socket.id})`);

      // Personal user room for notifications
      socket.join(`user:${userId}`);

      // Room subscriptions
      socket.on('join_project', (projectId: string) => {
        socket.join(`project:${projectId}`);
      });

      socket.on('leave_project', (projectId: string) => {
        socket.leave(`project:${projectId}`);
      });

      socket.on('join_issue', (issueId: string) => {
        socket.join(`issue:${issueId}`);
      });

      socket.on('leave_issue', (issueId: string) => {
        socket.leave(`issue:${issueId}`);
      });

      socket.on('disconnect', () => {
        console.log(`🔌 Socket disconnected: User ${userId} (${socket.id})`);
      });
    });

    return this.io;
  }

  public emitToProject(projectId: string, event: string, payload: any) {
    if (this.io) {
      this.io.to(`project:${projectId}`).emit(event, payload);
    }
  }

  public emitToIssue(issueId: string, event: string, payload: any) {
    if (this.io) {
      this.io.to(`issue:${issueId}`).emit(event, payload);
    }
  }

  public emitToUser(userId: string, event: string, payload: any) {
    if (this.io) {
      this.io.to(`user:${userId}`).emit(event, payload);
    }
  }
}

export const socketManager = SocketManager.getInstance();
