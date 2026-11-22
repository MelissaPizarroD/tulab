import { Router } from 'express';
import { turnoController } from '../controllers/turnoController';
import { permitirRoles, verificarToken } from '../middlewares/authMiddleware';

const router = Router();

router.get('/activo', verificarToken, turnoController.obtenerActivo);
router.post('/', verificarToken, turnoController.abrir);
router.patch('/:id/cerrar', verificarToken, turnoController.cerrar);
router.get('/historico', verificarToken, turnoController.obtenerHistorico);
router.get('/:id/detalle', verificarToken, turnoController.obtenerDetalle);
router.post('/', verificarToken, permitirRoles('encargado_sala'), turnoController.abrir);
router.patch('/:id/cerrar', verificarToken, permitirRoles('encargado_sala'), turnoController.cerrar);

export default router;