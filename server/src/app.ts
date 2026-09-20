import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import './infrastructure/database/connection';
import turnoRoutes from './presentation/routes/turnoRoutes';
import authRoutes from './presentation/routes/authRoutes';
import { dispositivoService } from './services/dispositivoService';
import dispositivoRoutes from './presentation/routes/dispositivoRoutes';
import estudianteRoutes from './presentation/routes/estudianteRoutes';
import registroAccesoRoutes from './presentation/routes/registroAccesoRoutes';
import sesionEquipoRoutes from './presentation/routes/sesionEquipoRoutes';
import novedadEquipoRoutes from './presentation/routes/novedadEquipoRoutes';
import bitacoraRoutes from './presentation/routes/bitacoraRoutes';
import programacionRecursoRoutes from './presentation/routes/programacionRecursoRoutes';
import configuracionRoutes from './presentation/routes/configuracionRoutes';
import sincronizacionRoutes from './presentation/routes/sincronizacionRoutes';


dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

io.on('connection', (socket) => {
  console.log('Panel conectado:', socket.id);
  socket.on('disconnect', () => {
    console.log('Panel desconectado:', socket.id);
  });
});

app.use('/api/turnos', turnoRoutes);
app.use('/api/auth', authRoutes);

app.use('/api/dispositivos', dispositivoRoutes);

setInterval(async () => {
  await dispositivoService.marcarDesconectados();
}, 30000);

app.use('/api/estudiantes', estudianteRoutes);
app.use('/api/registros-acceso', registroAccesoRoutes);
app.use('/api/sesiones', sesionEquipoRoutes);
app.use('/api/novedades', novedadEquipoRoutes);
app.use('/api/bitacora', bitacoraRoutes);
app.use('/api/programaciones', programacionRecursoRoutes);
app.use('/api/configuracion', configuracionRoutes);
app.use('/api/sincronizacion', sincronizacionRoutes);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Servidor TuLab corriendo en puerto ${PORT}`);
});

export { io };