import { Router } from 'express';
import { estudianteController } from '../controllers/estudianteController';
import { verificarToken } from '../middlewares/authMiddleware';

const router = Router();

router.get('/validar/:codigo_estudiantil', estudianteController.validarCodigo);
router.post('/visitantes', verificarToken, estudianteController.registrarVisitante);
router.get('/visitantes/validar/:codigo', estudianteController.validarCodigoTemporal);

export default router;