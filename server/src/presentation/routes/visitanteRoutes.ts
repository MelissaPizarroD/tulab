import { Router } from 'express';
import { visitanteController } from '../controllers/visitanteController';
import { verificarToken } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', verificarToken, visitanteController.registrar);
router.get('/vigentes', verificarToken, visitanteController.obtenerVigentes);
router.get('/validar/:codigo', visitanteController.validarCodigoTemporal);
router.patch('/:id/expiracion', verificarToken, visitanteController.actualizarExpiracion);

export default router;