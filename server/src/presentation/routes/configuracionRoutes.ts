import { Router } from 'express';
import { configuracionController } from '../controllers/configuracionController';
import { verificarToken } from '../middlewares/authMiddleware';

const router = Router();

router.get('/publica', configuracionController.obtenerTodas);
router.get('/', verificarToken, configuracionController.obtenerTodas);
router.patch('/:clave', verificarToken, configuracionController.actualizar);

export default router;