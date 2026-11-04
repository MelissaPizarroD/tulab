import { Server } from 'socket.io';
import type { Server as HttpServer } from 'http';

let io: Server | null = null;

export const initSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, { cors: { origin: '*' } });

  io.on('connection', (socket) => {
    console.log('Panel conectado:', socket.id);
    socket.on('disconnect', () => {
      console.log('Panel desconectado:', socket.id);
    });
  });

  return io;
};

export const emitirEvento = (evento: string, payload?: unknown) => {
  io?.emit(evento, payload);
};