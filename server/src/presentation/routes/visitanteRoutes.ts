import { Router } from 'express';
import { visitanteController } from '../controllers/visitanteController';
import { permitirRoles, verificarToken } from '../middlewares/authMiddleware';

const router = Router();

router.get('/vigentes', verificarToken, visitanteController.obtenerVigentes);
router.get('/validar/:codigo', visitanteController.validarCodigoTemporal);
router.post('/', verificarToken, permitirRoles('encargado_sala'), visitanteController.registrar);
router.patch('/:id/expiracion', verificarToken, permitirRoles('encargado_sala'), visitanteController.actualizarExpiracion);

export default router;