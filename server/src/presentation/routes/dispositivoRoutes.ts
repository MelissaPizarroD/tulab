import { Router } from 'express';
import { dispositivoController } from '../controllers/dispositivoController';
import { verificarToken } from '../middlewares/authMiddleware';

const router = Router();

router.post('/registrar', dispositivoController.registrar);
router.post('/:id/heartbeat', dispositivoController.heartbeat);
router.get('/', verificarToken, dispositivoController.obtenerTodos);

export default router;