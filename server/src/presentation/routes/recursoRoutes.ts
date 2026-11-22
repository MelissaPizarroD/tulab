import { Router } from 'express';
import { recursoController } from '../controllers/recursoController';
import { verificarToken, permitirRoles } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', verificarToken, recursoController.obtenerTodos);
router.get('/disponibilidad', verificarToken, recursoController.disponibilidad);
router.post('/', verificarToken, permitirRoles('encargado_sala'), recursoController.crear);
router.patch('/:id', verificarToken, permitirRoles('encargado_sala'), recursoController.actualizarActivo);

export default router;