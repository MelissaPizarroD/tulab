import { Router } from 'express';
import { novedadEquipoController } from '../controllers/novedadEquipoController';
import { verificarToken } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', novedadEquipoController.reportar);
router.get('/turno/:id_turno', verificarToken, novedadEquipoController.obtenerPorTurno);

export default router;