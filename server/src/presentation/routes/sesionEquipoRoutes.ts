import { Router } from 'express';
import { sesionEquipoController } from '../controllers/sesionEquipoController';
import { verificarToken } from '../middlewares/authMiddleware';

const router = Router();

router.post('/iniciar', sesionEquipoController.iniciar);
router.post('/cerrar', sesionEquipoController.cerrar);
router.get('/turno/:id_turno', verificarToken, sesionEquipoController.obtenerActivasPorTurno);

export default router;