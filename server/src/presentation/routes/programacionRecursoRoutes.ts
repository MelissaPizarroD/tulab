import { Router } from 'express';
import { programacionRecursoController } from '../controllers/programacionRecursoController';
import { verificarToken } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', verificarToken, programacionRecursoController.programar);
router.patch('/:id/estado', verificarToken, programacionRecursoController.actualizarEstado);
router.get('/turno/:id_turno', verificarToken, programacionRecursoController.obtenerPorTurno);

export default router;