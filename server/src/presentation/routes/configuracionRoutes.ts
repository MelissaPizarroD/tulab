import { Router } from 'express';
import { configuracionController } from '../controllers/configuracionController';
import { permitirRoles, verificarToken } from '../middlewares/authMiddleware';

const router = Router();

router.get('/publica', configuracionController.obtenerTodas);
router.get('/', verificarToken, configuracionController.obtenerTodas);
router.patch('/:clave', verificarToken, permitirRoles('encargado_sala'), configuracionController.actualizar);

export default router;