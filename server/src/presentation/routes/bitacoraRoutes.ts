import { Router } from 'express';
import { bitacoraController } from '../controllers/bitacoraController';
import { verificarToken } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', verificarToken, bitacoraController.registrar);
router.delete('/:id', verificarToken, bitacoraController.eliminar);
router.get('/turno/:id_turno', verificarToken, bitacoraController.obtenerPorTurno);

export default router;