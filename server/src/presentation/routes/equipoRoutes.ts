import { Router } from 'express';
import { equipoController } from '../controllers/equipoController';
import { verificarToken } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', verificarToken, equipoController.obtenerTodos);
router.post('/', verificarToken, equipoController.crear);
router.patch('/:id', verificarToken, equipoController.actualizarEstado);

export default router;