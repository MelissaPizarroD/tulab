import { Router } from 'express';
import { registroAccesoController } from '../controllers/registroAccesoController';
import { verificarToken } from '../middlewares/authMiddleware';

const router = Router();

router.post('/entrada', registroAccesoController.registrarEntrada);
router.post('/salida', registroAccesoController.registrarSalida);
router.get('/turno/:id_turno', verificarToken, registroAccesoController.obtenerActivosPorTurno);
router.get('/historico', verificarToken, registroAccesoController.obtenerHistorico);

export default router;