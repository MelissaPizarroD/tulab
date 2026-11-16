import { Router } from 'express';
import { turnoController } from '../controllers/turnoController';
import { verificarToken } from '../middlewares/authMiddleware';

const router = Router();

router.get('/activo', verificarToken, turnoController.obtenerActivo);
router.post('/', verificarToken, turnoController.abrir);
router.patch('/:id/cerrar', verificarToken, turnoController.cerrar);
router.get('/historico', verificarToken, turnoController.obtenerHistorico);
router.get('/:id/detalle', verificarToken, turnoController.obtenerDetalle);

export default router;