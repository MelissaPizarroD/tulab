process.env.TZ = 'America/Bogota';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { initSocket } from './infrastructure/realtime/socketServer';
import { config } from './config/env';
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
import equipoRoutes from './presentation/routes/equipoRoutes';
import { visitanteService } from './services/visitanteService';
import visitanteRoutes from './presentation/routes/visitanteRoutes';

const app = express();
const httpServer = createServer(app);

initSocket(httpServer);

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
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
app.use('/api/equipos', equipoRoutes);
app.use('/api/visitantes', visitanteRoutes);

const PORT = process.env.PORT || 3000;
httpServer.listen(config.port, () => {
  console.log(`Servidor TuLab corriendo en puerto ${config.port}`);
});

setInterval(async () => {
  await visitanteService.expirarVisitantesVencidos();
}, 60000);