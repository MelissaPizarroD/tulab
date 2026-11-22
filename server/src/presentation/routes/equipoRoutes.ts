import { Router } from 'express';
import { equipoController } from '../controllers/equipoController';
import { permitirRoles, verificarToken } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', verificarToken, equipoController.obtenerTodos);
router.post('/', verificarToken, permitirRoles('encargado_sala'), equipoController.crear);
router.patch('/:id', verificarToken, permitirRoles('encargado_sala'), equipoController.actualizarEstado);

export default router;