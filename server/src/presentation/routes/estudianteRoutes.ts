import { Router } from 'express';
import { estudianteController } from '../controllers/estudianteController';
import { verificarToken } from '../middlewares/authMiddleware';

const router = Router();

router.get('/validar/:codigo_estudiantil', estudianteController.validarCodigo);
router.post('/visitantes', verificarToken, estudianteController.registrarVisitante);
router.get('/visitantes/validar/:codigo', estudianteController.validarCodigoTemporal);
router.patch('/visitantes/:id/expiracion', verificarToken, estudianteController.actualizarExpiracion);
router.get('/visitantes/turno/:id_turno', verificarToken, estudianteController.obtenerVisitantesActivosPorTurno);

export default router;