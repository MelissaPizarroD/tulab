import { Router } from 'express';
import { programacionRecursoController } from '../controllers/programacionRecursoController';
import { permitirRoles, verificarToken } from '../middlewares/authMiddleware';

const router = Router();

router.get('/turno/:id_turno', verificarToken, programacionRecursoController.obtenerPorTurno);
router.post('/', verificarToken, permitirRoles('encargado_sala'), programacionRecursoController.programar);
router.patch('/:id/estado', verificarToken, permitirRoles('encargado_sala'), programacionRecursoController.actualizarEstado);

export default router;