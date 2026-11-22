import { Router } from 'express';
import { bitacoraController } from '../controllers/bitacoraController';
import { permitirRoles, verificarToken } from '../middlewares/authMiddleware';

const router = Router();

router.get('/turno/:id_turno', verificarToken, bitacoraController.obtenerPorTurno);
router.post('/', verificarToken, permitirRoles('encargado_sala'), bitacoraController.registrar);
router.delete('/:id', verificarToken, permitirRoles('encargado_sala'), bitacoraController.eliminar);
router.patch('/:id', verificarToken, permitirRoles('encargado_sala'), bitacoraController.editar);

export default router;