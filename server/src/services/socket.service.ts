import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { config } from '../config/index.js';

let io: SocketIOServer | null = null;

export function initSocketIO(server: HttpServer): SocketIOServer {
  io = new SocketIOServer(server, {
    cors: {
      origin: config.corsOrigin,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    socket.on('join_company_room', (companyId: string) => {
      socket.join(`company_${companyId}`);
      console.log(`[Socket.IO] Socket ${socket.id} joined company_${companyId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function emitCompanyNotification(companyId: string, event: string, payload: any) {
  if (io) {
    io.to(`company_${companyId}`).emit(event, payload);
  }
}
